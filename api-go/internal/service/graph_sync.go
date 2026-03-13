package service

import (
	"context"
	"log"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func syncPostToGraph(postID, userID int64) {
	ctx := context.Background()
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	_, err := session.Run(ctx,
		`MERGE (u:User {id: $userId})
		 MERGE (p:Post {id: $postId})
		 MERGE (u)-[:POSTED]->(p)
		 SET p.createdAt = datetime()`,
		map[string]interface{}{
			"userId": strconv.FormatInt(userID, 10),
			"postId": strconv.FormatInt(postID, 10),
		})
	if err != nil {
		log.Printf("[graph-sync] post sync failed: %v", err)
	}
}

func syncLikeToGraph(userID, postID int64) {
	ctx := context.Background()
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	_, err := session.Run(ctx,
		`MERGE (u:User {id: $userId})
		 MERGE (p:Post {id: $postId})
		 MERGE (u)-[:LIKED]->(p)
		 SET p.createdAt = datetime()`,
		map[string]interface{}{
			"userId": strconv.FormatInt(userID, 10),
			"postId": strconv.FormatInt(postID, 10),
		})
	if err != nil {
		log.Printf("[graph-sync] like sync failed: %v", err)
	}
}

func syncFollowToGraph(followerID, followingID int64) {
	ctx := context.Background()
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	followerStr := strconv.FormatInt(followerID, 10)
	followingStr := strconv.FormatInt(followingID, 10)

	// Enrich user data from postgres
	var followerUsername, followerDisplay, followingUsername, followingDisplay *string
	db.Pool.QueryRow(ctx, `SELECT username, display_name FROM "user" WHERE id = $1`, followerID).Scan(&followerUsername, &followerDisplay)
	db.Pool.QueryRow(ctx, `SELECT username, display_name FROM "user" WHERE id = $1`, followingID).Scan(&followingUsername, &followingDisplay)

	deref := func(s *string) string {
		if s != nil {
			return *s
		}
		return ""
	}

	_, err := session.Run(ctx,
		`MERGE (a:User {id: $followerId})
		 SET a.username = $followerUsername, a.displayName = $followerDisplay
		 MERGE (b:User {id: $followingId})
		 SET b.username = $followingUsername, b.displayName = $followingDisplay
		 MERGE (a)-[r:FOLLOWS]->(b)
		 SET r.createdAt = datetime()`,
		map[string]interface{}{
			"followerId":        followerStr,
			"followingId":       followingStr,
			"followerUsername":  deref(followerUsername),
			"followerDisplay":   deref(followerDisplay),
			"followingUsername": deref(followingUsername),
			"followingDisplay":  deref(followingDisplay),
		})
	if err != nil {
		log.Printf("[graph-sync] follow sync failed: %v", err)
	}
}

func removeFollowFromGraph(followerID, followingID int64) {
	ctx := context.Background()
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	_, err := session.Run(ctx,
		`MATCH (a:User {id: $followerId})-[r:FOLLOWS]->(b:User {id: $followingId}) DELETE r`,
		map[string]interface{}{
			"followerId":  strconv.FormatInt(followerID, 10),
			"followingId": strconv.FormatInt(followingID, 10),
		})
	if err != nil {
		log.Printf("[graph-sync] unfollow sync failed: %v", err)
	}
}

func SeedGraphFromPostgres(ctx context.Context) {
	log.Println("[graph-sync] Seeding Neo4j from PostgreSQL...")
	session := db.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	// Sync users
	rows, _ := db.Pool.Query(ctx, `SELECT id, username, display_name FROM "user"`)
	count := 0
	for rows.Next() {
		var id int64
		var username, displayName *string
		rows.Scan(&id, &username, &displayName)
		deref := func(s *string) string { if s != nil { return *s }; return "" }
		session.Run(ctx, `MERGE (u:User {id: $id}) SET u.username = $username, u.displayName = $displayName`,
			map[string]interface{}{"id": strconv.FormatInt(id, 10), "username": deref(username), "displayName": deref(displayName)})
		count++
	}
	rows.Close()
	log.Printf("[graph-sync] Synced %d users", count)

	// Sync follows
	rows, _ = db.Pool.Query(ctx, `SELECT "followerId", "followingId" FROM follows`)
	count = 0
	for rows.Next() {
		var fid, tid int64
		rows.Scan(&fid, &tid)
		session.Run(ctx, `MERGE (a:User {id: $fid}) MERGE (b:User {id: $tid}) MERGE (a)-[:FOLLOWS]->(b)`,
			map[string]interface{}{"fid": strconv.FormatInt(fid, 10), "tid": strconv.FormatInt(tid, 10)})
		count++
	}
	rows.Close()
	log.Printf("[graph-sync] Synced %d follows", count)

	// Sync posts
	rows, _ = db.Pool.Query(ctx, `SELECT id, "userId" FROM posts`)
	count = 0
	for rows.Next() {
		var pid, uid int64
		rows.Scan(&pid, &uid)
		session.Run(ctx, `MERGE (u:User {id: $uid}) MERGE (p:Post {id: $pid}) MERGE (u)-[:POSTED]->(p)`,
			map[string]interface{}{"uid": strconv.FormatInt(uid, 10), "pid": strconv.FormatInt(pid, 10)})
		count++
	}
	rows.Close()
	log.Printf("[graph-sync] Synced %d posts", count)

	// Sync likes
	rows, _ = db.Pool.Query(ctx, `SELECT "userId", "postId" FROM likes`)
	count = 0
	for rows.Next() {
		var uid, pid int64
		rows.Scan(&uid, &pid)
		session.Run(ctx, `MERGE (u:User {id: $uid}) MERGE (p:Post {id: $pid}) MERGE (u)-[:LIKED]->(p)`,
			map[string]interface{}{"uid": strconv.FormatInt(uid, 10), "pid": strconv.FormatInt(pid, 10)})
		count++
	}
	rows.Close()
	log.Printf("[graph-sync] Synced %d likes", count)
	log.Println("[graph-sync] Seed complete")
}
