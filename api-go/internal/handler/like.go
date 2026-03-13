package handler

import (
	"net/http"
	"strconv"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/middleware"
	"github.com/Aritra1235/scream/api-go/internal/service"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

type LikeHandler struct{ cfg *config.Config }

func NewLikeHandler(cfg *config.Config) *LikeHandler { return &LikeHandler{cfg: cfg} }

func (h *LikeHandler) Like(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct{ PostID string `json:"postId"` }
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	postID, _ := strconv.ParseInt(body.PostID, 10, 64)
	if err := service.LikePost(r.Context(), user.ID, postID); err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to like post")
		return
	}
	util.JSON(w, http.StatusOK, map[string]string{"message": "Post liked"})
}

func (h *LikeHandler) Unlike(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct{ PostID string `json:"postId"` }
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	postID, _ := strconv.ParseInt(body.PostID, 10, 64)
	if err := service.UnlikePost(r.Context(), user.ID, postID); err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to unlike post")
		return
	}
	util.JSON(w, http.StatusOK, map[string]string{"message": "Post unliked"})
}

func (h *LikeHandler) LikeCount(w http.ResponseWriter, r *http.Request) {
	var body struct{ PostID string `json:"postId"` }
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	postID, _ := strconv.ParseInt(body.PostID, 10, 64)
	count, err := service.GetPostLikesCount(r.Context(), postID)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get like count")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"count": count})
}

func (h *LikeHandler) Likes(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PostID string `json:"postId"`
		Limit  int    `json:"limit"`
		Offset int    `json:"offset"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	if body.Limit == 0 { body.Limit = 50 }
	postID, _ := strconv.ParseInt(body.PostID, 10, 64)
	likes, err := service.GetPostLikes(r.Context(), h.cfg, postID, body.Limit, body.Offset)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get likes")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"likes": likes})
}
