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

type GraphHandler struct{ cfg *config.Config }

func NewGraphHandler(cfg *config.Config) *GraphHandler { return &GraphHandler{cfg: cfg} }

func (h *GraphHandler) Suggestions(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 { limit = 5 }

	suggestions, err := service.GetWhoToFollow(r.Context(), h.cfg, strconv.FormatInt(user.ID, 10), limit)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get suggestions")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"suggestions": suggestions})
}

func (h *GraphHandler) MutualFollowers(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	username := chi.URLParam(r, "username")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 { limit = 10 }

	targetID, err := service.GetUserIDByUsername(r.Context(), username)
	if err != nil {
		util.Error(w, http.StatusNotFound, "User not found")
		return
	}

	mutuals, err := service.GetMutualFollowers(r.Context(), h.cfg,
		strconv.FormatInt(user.ID, 10), strconv.FormatInt(targetID, 10), limit)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get mutual followers")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"mutuals": mutuals})
}

func (h *GraphHandler) Trending(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit == 0 { limit = 10 }

	trending, err := service.GetTrendingUsers(r.Context(), h.cfg, limit)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get trending users")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"trending": trending})
}
