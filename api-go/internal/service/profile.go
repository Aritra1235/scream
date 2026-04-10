package service

import (
	"context"
	"fmt"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/models"
)

func GetUserByID(ctx context.Context, cfg *config.Config, userID int64) (*models.User, error) {
	var u models.User
	err := db.Pool.QueryRow(ctx,
		`SELECT id, username, display_name, "displayUsername", bio, avatar_url, banner_url,
		        verified, name, email, "emailVerified", image, onboarded,
		        followers_count, following_count, posts_count, "createdAt", "updatedAt"
		 FROM "user" WHERE id = $1`, userID,
	).Scan(
		&u.ID, &u.Username, &u.DisplayName, &u.DisplayUsername,
		&u.Bio, &u.AvatarURL, &u.BannerURL, &u.Verified,
		&u.Name, &u.Email, &u.EmailVerified, &u.Image, &u.Onboarded,
		&u.FollowersCount, &u.FollowingCount, &u.PostsCount,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	prefixCDN(cfg, &u)
	return &u, nil
}

func GetUserByUsername(ctx context.Context, cfg *config.Config, username string) (*models.User, error) {
	var userID int64
	err := db.Pool.QueryRow(ctx, `SELECT id FROM "user" WHERE username = $1`, username).Scan(&userID)
	if err != nil {
		return nil, err
	}
	return GetUserByID(ctx, cfg, userID)
}

func GetUserIDByUsername(ctx context.Context, username string) (int64, error) {
	var id int64
	err := db.Pool.QueryRow(ctx, `SELECT id FROM "user" WHERE username = $1`, username).Scan(&id)
	return id, err
}

func UpdateProfile(ctx context.Context, cfg *config.Config, userID int64, displayName, username, avatarURL, bannerURL *string) (*models.User, error) {
	setClauses := `"updatedAt" = NOW()`
	args := []interface{}{}
	argN := 1

	if displayName != nil {
		setClauses += fmt.Sprintf(`, display_name = $%d`, argN)
		args = append(args, *displayName)
		argN++
	}
	if username != nil {
		setClauses += fmt.Sprintf(`, username = $%d`, argN)
		args = append(args, *username)
		argN++
	}
	if avatarURL != nil {
		setClauses += fmt.Sprintf(`, avatar_url = $%d`, argN)
		args = append(args, *avatarURL)
		argN++
	}
	if bannerURL != nil {
		setClauses += fmt.Sprintf(`, banner_url = $%d`, argN)
		args = append(args, *bannerURL)
		argN++
	}

	args = append(args, userID)
	query := fmt.Sprintf(`UPDATE "user" SET %s WHERE id = $%d`, setClauses, argN)
	_, err := db.Pool.Exec(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	return GetUserByID(ctx, cfg, userID)
}

func prefixCDN(cfg *config.Config, u *models.User) {
	u.AvatarURL = buildOptionalAssetURL(cfg, u.AvatarURL)
	u.BannerURL = buildOptionalAssetURL(cfg, u.BannerURL)
}
