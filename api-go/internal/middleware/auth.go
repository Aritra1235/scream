package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/models"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

func extractSessionToken(raw string) string {
	if idx := strings.Index(raw, "."); idx > 0 {
		return raw[:idx]
	}
	return raw
}

type contextKey string

const (
	UserContextKey    contextKey = "user"
	SessionContextKey contextKey = "session"
)

func GetUser(ctx context.Context) *models.User {
	u, _ := ctx.Value(UserContextKey).(*models.User)
	return u
}

func GetSession(ctx context.Context) *models.Session {
	s, _ := ctx.Value(SessionContextKey).(*models.Session)
	return s
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("better-auth.session_token")
		if err != nil {
			util.Error(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		token := extractSessionToken(cookie.Value)
		if token == "" {
			util.Error(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		var session models.Session
		err = db.Pool.QueryRow(r.Context(),
			`SELECT s.id, s."userId", s.token, s."expiresAt" FROM session s WHERE s.token = $1 AND s."expiresAt" > $2`,
			token, time.Now(),
		).Scan(&session.ID, &session.UserID, &session.Token, &session.ExpiresAt)

		if err != nil {
			util.Error(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		var user models.User
		err = db.Pool.QueryRow(r.Context(),
			`SELECT id, username, display_name, "displayUsername", bio, avatar_url, banner_url,
			        verified, name, email, "emailVerified", image, onboarded,
			        followers_count, following_count, posts_count, "createdAt", "updatedAt"
			 FROM "user" WHERE id = $1`,
			session.UserID,
		).Scan(
			&user.ID, &user.Username, &user.DisplayName, &user.DisplayUsername,
			&user.Bio, &user.AvatarURL, &user.BannerURL, &user.Verified,
			&user.Name, &user.Email, &user.EmailVerified, &user.Image, &user.Onboarded,
			&user.FollowersCount, &user.FollowingCount, &user.PostsCount,
			&user.CreatedAt, &user.UpdatedAt,
		)

		if err != nil {
			util.Error(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, &user)
		ctx = context.WithValue(ctx, SessionContextKey, &session)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OptionalAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("better-auth.session_token")
		if err != nil || cookie.Value == "" {
			next.ServeHTTP(w, r)
			return
		}

		token := extractSessionToken(cookie.Value)
		var session models.Session
		err = db.Pool.QueryRow(r.Context(),
			`SELECT s.id, s."userId", s.token, s."expiresAt" FROM session s WHERE s.token = $1 AND s."expiresAt" > $2`,
			token, time.Now(),
		).Scan(&session.ID, &session.UserID, &session.Token, &session.ExpiresAt)

		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		var user models.User
		err = db.Pool.QueryRow(r.Context(),
			`SELECT id, username, display_name, "displayUsername", bio, avatar_url, banner_url,
			        verified, name, email, "emailVerified", image, onboarded,
			        followers_count, following_count, posts_count, "createdAt", "updatedAt"
			 FROM "user" WHERE id = $1`,
			session.UserID,
		).Scan(
			&user.ID, &user.Username, &user.DisplayName, &user.DisplayUsername,
			&user.Bio, &user.AvatarURL, &user.BannerURL, &user.Verified,
			&user.Name, &user.Email, &user.EmailVerified, &user.Image, &user.Onboarded,
			&user.FollowersCount, &user.FollowingCount, &user.PostsCount,
			&user.CreatedAt, &user.UpdatedAt,
		)

		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, &user)
		ctx = context.WithValue(ctx, SessionContextKey, &session)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
