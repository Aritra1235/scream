package service

import (
	"context"
	"log"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/models"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func GetWhoToFollow(ctx context.Context, cfg *config.Config, currentUserID string, limit int) ([]models.SuggestedUser, error) {
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	result, err := session.Run(ctx,
		`MATCH (me:User {id: $userId})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(suggestion)
		 WHERE suggestion.id <> $userId
		   AND NOT (me)-[:FOLLOWS]->(suggestion)
		 RETURN suggestion.id AS id, count(DISTINCT friend) AS mutualCount
		 ORDER BY mutualCount DESC
		 LIMIT $limit`,
		map[string]interface{}{"userId": currentUserID, "limit": limit})
	if err != nil {
		return getPopularUsers(ctx, cfg, currentUserID, limit)
	}

	var suggestions []struct {
		id          string
		mutualCount int
	}
	for result.Next(ctx) {
		record := result.Record()
		id, _ := record.Get("id")
		mc, _ := record.Get("mutualCount")
		suggestions = append(suggestions, struct {
			id          string
			mutualCount int
		}{
			id: id.(string), mutualCount: int(toInt64(mc)),
		})
	}

	if len(suggestions) == 0 {
		return getPopularUsers(ctx, cfg, currentUserID, limit)
	}

	return enrichUsers(ctx, cfg, suggestions)
}

func getPopularUsers(ctx context.Context, cfg *config.Config, currentUserID string, limit int) ([]models.SuggestedUser, error) {
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	result, err := session.Run(ctx,
		`MATCH (u:User)
		 WHERE u.id <> $userId
		   AND NOT EXISTS { MATCH (:User {id: $userId})-[:FOLLOWS]->(u) }
		 OPTIONAL MATCH (follower)-[:FOLLOWS]->(u)
		 RETURN u.id AS id, count(follower) AS followerCount
		 ORDER BY followerCount DESC
		 LIMIT $limit`,
		map[string]interface{}{"userId": currentUserID, "limit": limit})
	if err != nil {
		return []models.SuggestedUser{}, nil
	}

	var users []struct {
		id          string
		mutualCount int
	}
	for result.Next(ctx) {
		record := result.Record()
		id, _ := record.Get("id")
		users = append(users, struct {
			id          string
			mutualCount int
		}{id: id.(string), mutualCount: 0})
	}

	return enrichUsers(ctx, cfg, users)
}

func GetMutualFollowers(ctx context.Context, cfg *config.Config, currentUserID, targetUserID string, limit int) ([]models.MutualFollower, error) {
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	result, err := session.Run(ctx,
		`MATCH (me:User {id: $currentUserId})-[:FOLLOWS]->(mutual)-[:FOLLOWS]->(target:User {id: $targetUserId})
		 WHERE mutual.id <> $currentUserId AND mutual.id <> $targetUserId
		 RETURN mutual.id AS id
		 LIMIT $limit`,
		map[string]interface{}{"currentUserId": currentUserID, "targetUserId": targetUserID, "limit": limit})
	if err != nil {
		return []models.MutualFollower{}, nil
	}

	var ids []int64
	for result.Next(ctx) {
		record := result.Record()
		id, _ := record.Get("id")
		parsed, _ := strconv.ParseInt(id.(string), 10, 64)
		ids = append(ids, parsed)
	}

	if len(ids) == 0 {
		return []models.MutualFollower{}, nil
	}

	var mutuals []models.MutualFollower
	for _, id := range ids {
		var m models.MutualFollower
		var uid int64
		err := db.Pool.QueryRow(ctx,
			`SELECT id, username, display_name, avatar_url, verified FROM "user" WHERE id = $1`, id,
		).Scan(&uid, &m.Username, &m.DisplayName, &m.AvatarURL, &m.Verified)
		if err != nil {
			continue
		}
		m.ID = strconv.FormatInt(uid, 10)
		m.AvatarURL = buildOptionalAssetURL(cfg, m.AvatarURL)
		mutuals = append(mutuals, m)
	}
	return mutuals, nil
}

func GetTrendingUsers(ctx context.Context, cfg *config.Config, limit int) ([]models.TrendingUser, error) {
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	result, err := session.Run(ctx,
		`MATCH (u:User)
		 WHERE u.username IS NOT NULL AND u.username <> ""
		 OPTIONAL MATCH (follower)-[:FOLLOWS]->(u)
		 WITH u, count(DISTINCT follower) AS followers
		 OPTIONAL MATCH (u)-[:POSTED]->(p:Post)
		 WITH u, followers, count(DISTINCT p) AS postCount
		 WITH u, followers * 3 + postCount AS score
		 ORDER BY score DESC
		 LIMIT $limit
		 RETURN u.id AS id, score`,
		map[string]interface{}{"limit": limit})
	if err != nil {
		log.Printf("[graph] trending error: %v", err)
		return []models.TrendingUser{}, nil
	}

	type entry struct {
		id    string
		score int
	}
	var entries []entry
	for result.Next(ctx) {
		record := result.Record()
		id, _ := record.Get("id")
		score, _ := record.Get("score")
		entries = append(entries, entry{id: id.(string), score: int(toInt64(score))})
	}

	suggestions := make([]struct {
		id          string
		mutualCount int
	}, len(entries))
	for i, e := range entries {
		suggestions[i] = struct {
			id          string
			mutualCount int
		}{id: e.id, mutualCount: 0}
	}

	enriched, err := enrichUsers(ctx, cfg, suggestions)
	if err != nil {
		return []models.TrendingUser{}, nil
	}

	trending := make([]models.TrendingUser, len(enriched))
	for i, u := range enriched {
		trending[i] = models.TrendingUser{SuggestedUser: u}
		if i < len(entries) {
			trending[i].Score = entries[i].score
		}
	}
	return trending, nil
}

func enrichUsers(ctx context.Context, cfg *config.Config, graphUsers []struct {
	id          string
	mutualCount int
}) ([]models.SuggestedUser, error) {
	var result []models.SuggestedUser
	for _, gu := range graphUsers {
		id, _ := strconv.ParseInt(gu.id, 10, 64)
		var u models.SuggestedUser
		var uid int64
		err := db.Pool.QueryRow(ctx,
			`SELECT id, username, display_name, avatar_url, bio, verified, followers_count, following_count
			 FROM "user" WHERE id = $1`, id,
		).Scan(&uid, &u.Username, &u.DisplayName, &u.AvatarURL, &u.Bio, &u.Verified, &u.FollowersCount, &u.FollowingCount)
		if err != nil {
			continue
		}
		u.ID = strconv.FormatInt(uid, 10)
		u.MutualCount = gu.mutualCount
		u.AvatarURL = buildOptionalAssetURL(cfg, u.AvatarURL)
		result = append(result, u)
	}
	if result == nil {
		result = []models.SuggestedUser{}
	}
	return result, nil
}

func toInt64(v interface{}) int64 {
	switch val := v.(type) {
	case int64:
		return val
	case int:
		return int64(val)
	case float64:
		return int64(val)
	default:
		return 0
	}
}
