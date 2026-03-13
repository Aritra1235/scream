package service

import (
	"context"
	"fmt"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/models"
)

func FollowUser(ctx context.Context, followerID, followingID int64) error {
	if followerID == followingID {
		return fmt.Errorf("cannot follow yourself")
	}

	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var exists bool
	tx.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM follows WHERE "followerId" = $1 AND "followingId" = $2)`,
		followerID, followingID).Scan(&exists)
	if exists {
		return fmt.Errorf("already following this user")
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO follows ("followerId", "followingId", "createdAt") VALUES ($1, $2, NOW())`,
		followerID, followingID)
	if err != nil {
		return err
	}

	_, _ = tx.Exec(ctx, `UPDATE "user" SET following_count = following_count + 1 WHERE id = $1`, followerID)
	_, _ = tx.Exec(ctx, `UPDATE "user" SET followers_count = followers_count + 1 WHERE id = $1`, followingID)

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	go syncFollowToGraph(followerID, followingID)
	return nil
}

func UnfollowUser(ctx context.Context, followerID, followingID int64) error {
	if followerID == followingID {
		return fmt.Errorf("cannot unfollow yourself")
	}

	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx,
		`DELETE FROM follows WHERE "followerId" = $1 AND "followingId" = $2`,
		followerID, followingID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("not following this user")
	}

	_, _ = tx.Exec(ctx, `UPDATE "user" SET following_count = following_count - 1 WHERE id = $1`, followerID)
	_, _ = tx.Exec(ctx, `UPDATE "user" SET followers_count = followers_count - 1 WHERE id = $1`, followingID)

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	go removeFollowFromGraph(followerID, followingID)
	return nil
}

func IsFollowing(ctx context.Context, followerID, followingID int64) (bool, error) {
	var exists bool
	err := db.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM follows WHERE "followerId" = $1 AND "followingId" = $2)`,
		followerID, followingID).Scan(&exists)
	return exists, err
}

func GetFollowers(ctx context.Context, cfg *config.Config, userID int64, limit, offset int) ([]models.FollowUserInfo, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.verified, u.followers_count, u.following_count
		 FROM follows f
		 INNER JOIN "user" u ON f."followerId" = u.id
		 WHERE f."followingId" = $1
		 ORDER BY f."createdAt" DESC
		 LIMIT $2 OFFSET $3`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFollowUsers(rows, cfg)
}

func GetFollowing(ctx context.Context, cfg *config.Config, userID int64, limit, offset int) ([]models.FollowUserInfo, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.verified, u.followers_count, u.following_count
		 FROM follows f
		 INNER JOIN "user" u ON f."followingId" = u.id
		 WHERE f."followerId" = $1
		 ORDER BY f."createdAt" DESC
		 LIMIT $2 OFFSET $3`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFollowUsers(rows, cfg)
}

func scanFollowUsers(rows interface{ Next() bool; Scan(dest ...interface{}) error }, cfg *config.Config) ([]models.FollowUserInfo, error) {
	var result []models.FollowUserInfo
	for rows.Next() {
		var u models.FollowUserInfo
		var id int64
		if err := rows.Scan(&id, &u.Username, &u.DisplayName, &u.AvatarURL, &u.Bio, &u.Verified, &u.FollowersCount, &u.FollowingCount); err != nil {
			return nil, err
		}
		u.ID = strconv.FormatInt(id, 10)
		if u.AvatarURL != nil {
			v := cfg.CDNBaseURL + "/" + *u.AvatarURL
			u.AvatarURL = &v
		}
		result = append(result, u)
	}
	if result == nil {
		result = []models.FollowUserInfo{}
	}
	return result, nil
}
