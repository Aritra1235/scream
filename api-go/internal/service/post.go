package service

import (
	"context"
	"fmt"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/models"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

func CreatePost(ctx context.Context, userID int64, content string, mediaCount int) (*models.Post, error) {
	id := util.GenerateID()
	var post models.Post
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO posts (id, "userId", content, "mediaCount", visibility, likes_count, "createdAt", "updatedAt")
		 VALUES ($1, $2, $3, $4, 'public', 0, NOW(), NOW())
		 RETURNING id, "userId", content, "parentId", "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt"`,
		id, userID, content, mediaCount,
	).Scan(&post.ID, &post.UserID, &post.Content, &post.ParentID, &post.RepostOf,
		&post.MediaCount, &post.Visibility, &post.LikesCount, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, err
	}

	_, _ = db.Pool.Exec(ctx, `UPDATE "user" SET posts_count = posts_count + 1 WHERE id = $1`, userID)
	go syncPostToGraph(id, userID)
	return &post, nil
}

func CreateReply(ctx context.Context, userID, parentID int64, content string, mediaCount int) (*models.Post, error) {
	var exists bool
	db.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1)`, parentID).Scan(&exists)
	if !exists {
		return nil, fmt.Errorf("parent post not found")
	}

	id := util.GenerateID()
	var post models.Post
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO posts (id, "userId", content, "parentId", "mediaCount", visibility, likes_count, "createdAt", "updatedAt")
		 VALUES ($1, $2, $3, $4, $5, 'public', 0, NOW(), NOW())
		 RETURNING id, "userId", content, "parentId", "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt"`,
		id, userID, content, parentID, mediaCount,
	).Scan(&post.ID, &post.UserID, &post.Content, &post.ParentID, &post.RepostOf,
		&post.MediaCount, &post.Visibility, &post.LikesCount, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, err
	}

	_, _ = db.Pool.Exec(ctx, `UPDATE "user" SET posts_count = posts_count + 1 WHERE id = $1`, userID)
	return &post, nil
}

func RepostPost(ctx context.Context, userID, repostOf int64) (*models.Post, error) {
	id := util.GenerateID()
	var post models.Post
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO posts (id, "userId", content, "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt")
		 VALUES ($1, $2, '', $3, 0, 'public', 0, NOW(), NOW())
		 RETURNING id, "userId", content, "parentId", "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt"`,
		id, userID, repostOf,
	).Scan(&post.ID, &post.UserID, &post.Content, &post.ParentID, &post.RepostOf,
		&post.MediaCount, &post.Visibility, &post.LikesCount, &post.CreatedAt, &post.UpdatedAt)
	return &post, err
}

func CreateQuoteRepost(ctx context.Context, userID, repostOf int64, content string, mediaCount int) (*models.Post, error) {
	id := util.GenerateID()
	var post models.Post
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO posts (id, "userId", content, "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt")
		 VALUES ($1, $2, $3, $4, $5, 'public', 0, NOW(), NOW())
		 RETURNING id, "userId", content, "parentId", "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt"`,
		id, userID, content, repostOf, mediaCount,
	).Scan(&post.ID, &post.UserID, &post.Content, &post.ParentID, &post.RepostOf,
		&post.MediaCount, &post.Visibility, &post.LikesCount, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, err
	}
	_, _ = db.Pool.Exec(ctx, `UPDATE "user" SET posts_count = posts_count + 1 WHERE id = $1`, userID)
	return &post, err
}

func DeletePost(ctx context.Context, postID, userID int64) (*models.Post, error) {
	var post models.Post
	err := db.Pool.QueryRow(ctx,
		`DELETE FROM posts WHERE id = $1 AND "userId" = $2
		 RETURNING id, "userId", content, "parentId", "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt"`,
		postID, userID,
	).Scan(&post.ID, &post.UserID, &post.Content, &post.ParentID, &post.RepostOf,
		&post.MediaCount, &post.Visibility, &post.LikesCount, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, err
	}
	_, _ = db.Pool.Exec(ctx, `UPDATE "user" SET posts_count = posts_count - 1 WHERE id = $1`, userID)
	return &post, nil
}

func GetPostsByUserID(ctx context.Context, userID int64, limit, offset int) ([]map[string]interface{}, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, "userId", content, "parentId", "repostOf", "mediaCount", visibility, likes_count, "createdAt", "updatedAt"
		 FROM posts WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var p models.Post
		rows.Scan(&p.ID, &p.UserID, &p.Content, &p.ParentID, &p.RepostOf,
			&p.MediaCount, &p.Visibility, &p.LikesCount, &p.CreatedAt, &p.UpdatedAt)
		result = append(result, map[string]interface{}{
			"id": strconv.FormatInt(p.ID, 10), "userId": strconv.FormatInt(p.UserID, 10),
			"content": p.Content, "mediaCount": p.MediaCount,
			"createdAt": p.CreatedAt, "updatedAt": p.UpdatedAt,
		})
	}
	if result == nil {
		result = []map[string]interface{}{}
	}
	return result, nil
}

func IsPostOwner(ctx context.Context, postID, userID int64) bool {
	var exists bool
	db.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1 AND "userId" = $2)`, postID, userID).Scan(&exists)
	return exists
}
