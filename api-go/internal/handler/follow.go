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

type FollowHandler struct{ cfg *config.Config }

func NewFollowHandler(cfg *config.Config) *FollowHandler { return &FollowHandler{cfg: cfg} }

func (h *FollowHandler) Follow(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct{ TargetUserID string `json:"targetUserId"` }
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	targetID, _ := strconv.ParseInt(body.TargetUserID, 10, 64)
	err := service.FollowUser(r.Context(), user.ID, targetID)
	if err != nil {
		switch err.Error() {
		case "cannot follow yourself":
			util.Error(w, http.StatusBadRequest, err.Error())
		case "already following this user":
			util.Error(w, http.StatusConflict, err.Error())
		default:
			util.Error(w, http.StatusInternalServerError, "Failed to follow user")
		}
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "Followed successfully",
		"followerId": strconv.FormatInt(user.ID, 10),
		"followingId": body.TargetUserID,
	})
}

func (h *FollowHandler) Unfollow(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct{ TargetUserID string `json:"targetUserId"` }
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	targetID, _ := strconv.ParseInt(body.TargetUserID, 10, 64)
	err := service.UnfollowUser(r.Context(), user.ID, targetID)
	if err != nil {
		if err.Error() == "not following this user" {
			util.Error(w, http.StatusNotFound, err.Error())
		} else {
			util.Error(w, http.StatusInternalServerError, "Failed to unfollow user")
		}
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "Unfollowed successfully",
		"followerId": strconv.FormatInt(user.ID, 10),
		"followingId": body.TargetUserID,
	})
}

func (h *FollowHandler) Status(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	targetID, _ := strconv.ParseInt(chi.URLParam(r, "userId"), 10, 64)
	following, _ := service.IsFollowing(r.Context(), user.ID, targetID)
	util.JSON(w, http.StatusOK, map[string]bool{"isFollowing": following})
}

func (h *FollowHandler) Followers(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	userID, err := service.GetUserIDByUsername(r.Context(), username)
	if err != nil {
		util.Error(w, http.StatusNotFound, "User not found")
		return
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 { limit = 20 }

	followers, err := service.GetFollowers(r.Context(), h.cfg, userID, limit, offset)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get followers")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"followers": followers})
}

func (h *FollowHandler) Following(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	userID, err := service.GetUserIDByUsername(r.Context(), username)
	if err != nil {
		util.Error(w, http.StatusNotFound, "User not found")
		return
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 { limit = 20 }

	following, err := service.GetFollowing(r.Context(), h.cfg, userID, limit, offset)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get following")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"following": following})
}
