package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/middleware"
	"github.com/Aritra1235/scream/api-go/internal/service"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

type FeedHandler struct{ cfg *config.Config }

func NewFeedHandler(cfg *config.Config) *FeedHandler { return &FeedHandler{cfg: cfg} }

func (h *FeedHandler) GetFeed(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 {
		limit = 20
	}

	uid := user.ID
	posts, err := service.GetSimpleFeed(r.Context(), h.cfg, limit, offset, &uid)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to load feed")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"posts": posts})
}

func (h *FeedHandler) GetFollowingFeed(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 {
		limit = 20
	}

	posts, err := service.GetFollowingFeed(r.Context(), h.cfg, user.ID, limit, offset)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to load following feed")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"posts": posts})
}

func (h *FeedHandler) GetUserFeed(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 {
		limit = 20
	}

	user := middleware.GetUser(r.Context())
	var uid *int64
	if user != nil {
		uid = &user.ID
	}

	posts, err := service.GetUserFeed(r.Context(), h.cfg, username, limit, offset, uid)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to load user posts")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"posts": posts})
}
