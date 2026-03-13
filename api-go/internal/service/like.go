package service

import (
	"context"
	"fmt"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/db"
)

func LikePost(ctx context.Context, userID, postID int64) error {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `INSERT INTO likes ("userId", "postId", "createdAt") VALUES ($1, $2, NOW())`, userID, postID)
	if err != nil {
		return fmt.Errorf("failed to like post")
	}

	_, err = tx.Exec(ctx, `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, postID)
	if err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	go syncLikeToGraph(userID, postID)
	return nil
}

func UnlikePost(ctx context.Context, userID, postID int64) error {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `DELETE FROM likes WHERE "userId" = $1 AND "postId" = $2`, userID, postID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("like not found")
	}

	_, _ = tx.Exec(ctx, `UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1`, postID)
	return tx.Commit(ctx)
}

func GetPostLikesCount(ctx context.Context, postID int64) (int, error) {
	var count int
	err := db.Pool.QueryRow(ctx, `SELECT likes_count FROM posts WHERE id = $1`, postID).Scan(&count)
	return count, err
}

type LikeUser struct {
	UserID      string  `json:"userId"`
	Username    *string `json:"username"`
	DisplayName *string `json:"displayName"`
	AvatarURL   *string `json:"avatar_url"`
	Verified    bool    `json:"verified"`
}

func GetPostLikes(ctx context.Context, cfg *config.Config, postID int64, limit, offset int) ([]LikeUser, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT u.id, u.username, u.display_name, u.avatar_url, u.verified
		 FROM likes l
		 INNER JOIN "user" u ON l."userId" = u.id
		 WHERE l."postId" = $1
		 ORDER BY l."createdAt" DESC
		 LIMIT $2 OFFSET $3`, postID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []LikeUser
	for rows.Next() {
		var u LikeUser
		var id int64
		rows.Scan(&id, &u.Username, &u.DisplayName, &u.AvatarURL, &u.Verified)
		u.UserID = strconv.FormatInt(id, 10)
		if u.AvatarURL != nil {
			v := cfg.CDNBaseURL + "/" + *u.AvatarURL
			u.AvatarURL = &v
		}
		result = append(result, u)
	}
	if result == nil {
		result = []LikeUser{}
	}
	return result, nil
}
