package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/handler"
	"github.com/Aritra1235/scream/api-go/internal/middleware"
	"github.com/Aritra1235/scream/api-go/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := db.InitPostgres(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer db.ClosePostgres()

	if err := db.InitNeo4j(cfg.Neo4jURI, cfg.Neo4jUser, cfg.Neo4jPassword); err != nil {
		log.Printf("Warning: Neo4j connection failed: %v", err)
	} else {
		ctx := context.Background()
		db.InitNeo4jSchema(ctx)
		go service.SeedGraphFromPostgres(ctx)
		defer db.CloseNeo4j(ctx)
	}

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.SkipAuthProxyCORS(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World!"))
	})

	// Auth proxy to TS server
	authProxy := handler.NewAuthProxy(cfg)
	r.Handle("/api/auth/*", authProxy)

	// API v1 routes
	profileH := handler.NewProfileHandler(cfg)
	postH := handler.NewPostHandler(cfg)
	feedH := handler.NewFeedHandler(cfg)
	likeH := handler.NewLikeHandler(cfg)
	followH := handler.NewFollowHandler(cfg)
	graphH := handler.NewGraphHandler(cfg)
	onboardingH := handler.NewOnboardingHandler()
	usernameH := handler.NewUsernameHandler()

	r.Route("/api/v1", func(r chi.Router) {
		// Profile
		r.With(middleware.Auth).Get("/profile/me", profileH.GetMe)
		r.Get("/profile/by-id/{userId}", profileH.GetByID)
		r.Get("/profile/{username}", profileH.GetByUsername)
		r.With(middleware.Auth).Put("/profile/me", profileH.UpdateMe)

		// Posts
		r.With(middleware.Auth).Post("/post/create", postH.Create)
		r.With(middleware.Auth).Post("/post/reply", postH.Reply)
		r.With(middleware.Auth).Post("/post/repost", postH.Repost)
		r.With(middleware.Auth).Post("/post/quote", postH.Quote)
		r.With(middleware.Auth).Post("/post/delete", postH.Delete)
		r.Get("/post/{username}", postH.GetByUsername)
		r.With(middleware.OptionalAuth).Get("/post/id/{postId}", postH.GetByID)

		// Feed
		r.With(middleware.Auth).Get("/feed", feedH.GetFeed)
		r.With(middleware.Auth).Get("/feed/following", feedH.GetFollowingFeed)
		r.With(middleware.OptionalAuth).Get("/feed/user/{username}", feedH.GetUserFeed)

		// Likes
		r.With(middleware.Auth).Post("/like/like", likeH.Like)
		r.With(middleware.Auth).Post("/like/unlike", likeH.Unlike)
		r.With(middleware.Auth).Post("/like/likeCount", likeH.LikeCount)
		r.With(middleware.Auth).Post("/like/likes", likeH.Likes)

		// Follow
		r.With(middleware.Auth).Post("/follow", followH.Follow)
		r.With(middleware.Auth).Post("/unfollow", followH.Unfollow)
		r.With(middleware.Auth).Get("/follow/status/{userId}", followH.Status)
		r.Get("/followers/{username}", followH.Followers)
		r.Get("/following/{username}", followH.Following)

		// Graph (Neo4j)
		r.With(middleware.Auth).Get("/graph/suggestions", graphH.Suggestions)
		r.With(middleware.Auth).Get("/graph/mutual/{username}", graphH.MutualFollowers)
		r.Get("/graph/trending", graphH.Trending)

		// Onboarding
		r.Get("/onboarding/{userId}", onboardingH.GetStatus)
		r.With(middleware.Auth).Post("/onboarding", onboardingH.Complete)

		// Username
		r.Get("/username/{username}", usernameH.CheckAvailability)
	})

	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{Addr: addr, Handler: r}

	go func() {
		log.Printf("Go API server running at http://localhost%s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("Server shut down")
}
