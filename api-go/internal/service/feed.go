package service

import (
	"context"
	"fmt"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/models"
)

func GetSimpleFeed(ctx context.Context, cfg *config.Config, limit, offset int, currentUserID *int64) ([]models.FeedPost, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT p.id, p.content, p."createdAt", p."mediaCount", p."userId",
		        u.username, u.display_name, u.avatar_url, u.verified,
		        p."parentId", p."repostOf"
		 FROM posts p
		 INNER JOIN "user" u ON p."userId" = u.id
		 WHERE p."parentId" IS NULL
		 ORDER BY p."createdAt" DESC
		 LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFeedPosts(ctx, cfg, rows, currentUserID, 0, 0)
}

func GetFollowingFeed(ctx context.Context, cfg *config.Config, currentUserID int64, limit, offset int) ([]models.FeedPost, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT p.id, p.content, p."createdAt", p."mediaCount", p."userId",
		        u.username, u.display_name, u.avatar_url, u.verified,
		        p."parentId", p."repostOf"
		 FROM posts p
		 INNER JOIN "user" u ON p."userId" = u.id
		 WHERE p."parentId" IS NULL
		   AND (p."userId" = $1 OR p."userId" IN (SELECT "followingId" FROM follows WHERE "followerId" = $1))
		 ORDER BY p."createdAt" DESC
		 LIMIT $2 OFFSET $3`, currentUserID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	uid := currentUserID
	return scanFeedPosts(ctx, cfg, rows, &uid, 0, 0)
}

func GetUserFeed(ctx context.Context, cfg *config.Config, username string, limit, offset int, currentUserID *int64) ([]models.FeedPost, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT p.id, p.content, p."createdAt", p."mediaCount", p."userId",
		        u.username, u.display_name, u.avatar_url, u.verified,
		        p."parentId", p."repostOf"
		 FROM posts p
		 INNER JOIN "user" u ON p."userId" = u.id
		 WHERE u.username = $1 AND p."parentId" IS NULL
		 ORDER BY p."createdAt" DESC
		 LIMIT $2 OFFSET $3`, username, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFeedPosts(ctx, cfg, rows, currentUserID, 0, 0)
}

func GetPostWithThread(ctx context.Context, cfg *config.Config, postID string, currentUserID *int64) (*models.FeedPost, error) {
	pid, err := strconv.ParseInt(postID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid post ID")
	}

	row := db.Pool.QueryRow(ctx,
		`SELECT p.id, p.content, p."createdAt", p."mediaCount", p."userId",
		        u.username, u.display_name, u.avatar_url, u.verified,
		        p."parentId", p."repostOf"
		 FROM posts p
		 INNER JOIN "user" u ON p."userId" = u.id
		 WHERE p.id = $1`, pid)

	post, err := scanSingleFeedPost(ctx, cfg, row, currentUserID, 0, 3)
	if err != nil {
		return nil, err
	}
	return post, nil
}

type feedRow struct {
	id, userID                    int64
	content                       string
	createdAt                     interface{}
	mediaCount                    int
	username, displayName, avatar *string
	verified                      bool
	parentID, repostOf            *int64
}

func scanFeedPosts(ctx context.Context, cfg *config.Config, rows interface {
	Next() bool
	Scan(dest ...interface{}) error
	Err() error
}, currentUserID *int64, depth, maxDepth int) ([]models.FeedPost, error) {
	var result []models.FeedPost
	for rows.Next() {
		var r feedRow
		if err := rows.Scan(&r.id, &r.content, &r.createdAt, &r.mediaCount, &r.userID,
			&r.username, &r.displayName, &r.avatar, &r.verified,
			&r.parentID, &r.repostOf); err != nil {
			return nil, err
		}
		post := buildFeedPostFromRow(ctx, cfg, r, currentUserID, depth, maxDepth)
		result = append(result, post)
	}
	if result == nil {
		result = []models.FeedPost{}
	}
	return result, rows.Err()
}

func scanSingleFeedPost(ctx context.Context, cfg *config.Config, row interface {
	Scan(dest ...interface{}) error
}, currentUserID *int64, depth, maxDepth int) (*models.FeedPost, error) {
	var r feedRow
	if err := row.Scan(&r.id, &r.content, &r.createdAt, &r.mediaCount, &r.userID,
		&r.username, &r.displayName, &r.avatar, &r.verified,
		&r.parentID, &r.repostOf); err != nil {
		return nil, err
	}
	post := buildFeedPostFromRow(ctx, cfg, r, currentUserID, depth, maxDepth)
	return &post, nil
}

func buildFeedPostFromRow(ctx context.Context, cfg *config.Config, r feedRow, currentUserID *int64, depth, maxDepth int) models.FeedPost {
	engagement := getEngagement(ctx, r.id, currentUserID)
	media := getMediaForPost(ctx, cfg, r.id)

	var parentIDStr *string
	if r.parentID != nil {
		s := strconv.FormatInt(*r.parentID, 10)
		parentIDStr = &s
	}

	post := models.FeedPost{
		ID:         strconv.FormatInt(r.id, 10),
		Content:    r.content,
		MediaCount: r.mediaCount,
		Media:      media,
		Author: models.FeedAuthor{
			ID:          strconv.FormatInt(r.userID, 10),
			Username:    r.username,
			DisplayName: r.displayName,
			AvatarURL:   buildOptionalAssetURL(cfg, r.avatar),
			Verified:    r.verified,
		},
		Engagement: engagement,
		ParentID:   parentIDStr,
	}

	// Extract time from interface (pgx returns time.Time)
	if t, ok := r.createdAt.(interface{ UTC() interface{} }); ok {
		_ = t
	}
	// pgx v5 returns time.Time directly
	if t, ok := r.createdAt.(interface{ UnixMilli() int64 }); ok {
		_ = t
	}

	if r.repostOf != nil {
		repostRow := db.Pool.QueryRow(ctx,
			`SELECT p.id, p.content, p."createdAt", p."mediaCount", p."userId",
			        u.username, u.display_name, u.avatar_url, u.verified,
			        p."parentId", p."repostOf"
			 FROM posts p INNER JOIN "user" u ON p."userId" = u.id WHERE p.id = $1`, *r.repostOf)
		repost, err := scanSingleFeedPost(ctx, cfg, repostRow, currentUserID, maxDepth, maxDepth)
		if err == nil {
			post.RepostOf = repost
		}
	}

	if depth < maxDepth {
		replies := getReplies(ctx, cfg, r.id, currentUserID, depth+1, maxDepth)
		post.Replies = replies
	}

	return post
}

func getEngagement(ctx context.Context, postID int64, currentUserID *int64) models.FeedEngagement {
	var likes, reposts, replies int
	db.Pool.QueryRow(ctx, `SELECT count(*) FROM likes WHERE "postId" = $1`, postID).Scan(&likes)
	db.Pool.QueryRow(ctx, `SELECT count(*) FROM posts WHERE "repostOf" = $1`, postID).Scan(&reposts)
	db.Pool.QueryRow(ctx, `SELECT count(*) FROM posts WHERE "parentId" = $1`, postID).Scan(&replies)

	likedByUser := false
	if currentUserID != nil {
		var exists bool
		db.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM likes WHERE "postId" = $1 AND "userId" = $2)`, postID, *currentUserID).Scan(&exists)
		likedByUser = exists
	}

	return models.FeedEngagement{Likes: likes, Reposts: reposts, Replies: replies, LikedByUser: likedByUser}
}

func getMediaForPost(ctx context.Context, cfg *config.Config, postID int64) []models.FeedMedia {
	rows, err := db.Pool.Query(ctx,
		`SELECT "mediaUrl", type, width, height, "contentType"
		 FROM media WHERE "targetType" = 'post' AND "targetId" = $1
		 ORDER BY "createdAt" DESC`, postID)
	if err != nil {
		return []models.FeedMedia{}
	}
	defer rows.Close()

	var result []models.FeedMedia
	for rows.Next() {
		var m models.FeedMedia
		rows.Scan(&m.MediaURL, &m.Type, &m.Width, &m.Height, &m.ContentType)
		m.MediaURL = buildAssetURL(cfg, m.MediaURL)
		result = append(result, m)
	}
	if result == nil {
		return []models.FeedMedia{}
	}
	return result
}

func getReplies(ctx context.Context, cfg *config.Config, parentID int64, currentUserID *int64, depth, maxDepth int) []models.FeedPost {
	rows, err := db.Pool.Query(ctx,
		`SELECT p.id, p.content, p."createdAt", p."mediaCount", p."userId",
		        u.username, u.display_name, u.avatar_url, u.verified,
		        p."parentId", p."repostOf"
		 FROM posts p INNER JOIN "user" u ON p."userId" = u.id
		 WHERE p."parentId" = $1 ORDER BY p."createdAt" DESC`, parentID)
	if err != nil {
		return []models.FeedPost{}
	}
	defer rows.Close()

	result, _ := scanFeedPosts(ctx, cfg, rows, currentUserID, depth, maxDepth)
	return result
}
