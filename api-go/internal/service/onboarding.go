package service

import (
	"context"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/db"
)

type OnboardingStatus struct {
	Onboarded     bool `json:"onboarded"`
	EmailVerified bool `json:"emailVerified"`
}

func GetOnboardingStatus(ctx context.Context, userID string) (*OnboardingStatus, error) {
	id, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return nil, err
	}

	var status OnboardingStatus
	err = db.Pool.QueryRow(ctx,
		`SELECT onboarded, "emailVerified" FROM "user" WHERE id = $1`, id,
	).Scan(&status.Onboarded, &status.EmailVerified)
	if err != nil {
		return nil, err
	}
	return &status, nil
}

func CompleteOnboarding(ctx context.Context, userID int64, username, displayName string, bio, avatarURL, bannerURL *string) error {
	_, err := db.Pool.Exec(ctx,
		`UPDATE "user" SET
		  username = $2, "displayUsername" = $2, display_name = $3,
		  bio = COALESCE($4, bio), avatar_url = COALESCE($5, avatar_url),
		  banner_url = COALESCE($6, banner_url), onboarded = true, "updatedAt" = NOW()
		 WHERE id = $1`,
		userID, username, displayName, bio, avatarURL, bannerURL)
	return err
}
