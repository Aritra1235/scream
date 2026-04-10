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

type PostHandler struct{ cfg *config.Config }

func NewPostHandler(cfg *config.Config) *PostHandler { return &PostHandler{cfg: cfg} }

func (h *PostHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		Content    string `json:"content"`
		MediaCount int    `json:"mediaCount"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}

	post, err := service.CreatePost(r.Context(), user.ID, body.Content, body.MediaCount)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to create post")
		return
	}

	util.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "Post created",
		"post": map[string]interface{}{
			"id": strconv.FormatInt(post.ID, 10), "userId": strconv.FormatInt(post.UserID, 10),
			"content": post.Content, "parentId": nil, "repostOf": nil,
			"mediaCount": post.MediaCount, "visibility": post.Visibility,
			"likes_count": post.LikesCount, "createdAt": post.CreatedAt, "updatedAt": post.UpdatedAt,
		},
	})
}

func (h *PostHandler) Reply(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		ParentID   string `json:"parentId"`
		Content    string `json:"content"`
		MediaCount int    `json:"mediaCount"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}

	parentID, err := strconv.ParseInt(body.ParentID, 10, 64)
	if err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid parentId")
		return
	}

	post, err := service.CreateReply(r.Context(), user.ID, parentID, body.Content, body.MediaCount)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	var parentStr *string
	if post.ParentID != nil {
		s := strconv.FormatInt(*post.ParentID, 10)
		parentStr = &s
	}

	util.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "Reply created",
		"post": map[string]interface{}{
			"id": strconv.FormatInt(post.ID, 10), "userId": strconv.FormatInt(post.UserID, 10),
			"content": post.Content, "parentId": parentStr,
		},
	})
}

func (h *PostHandler) Repost(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		RepostOf string `json:"repostOf"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	repostOf, _ := strconv.ParseInt(body.RepostOf, 10, 64)
	post, err := service.RepostPost(r.Context(), user.ID, repostOf)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to repost")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"message": "Post reposted", "post": map[string]interface{}{
		"id": strconv.FormatInt(post.ID, 10), "userId": strconv.FormatInt(post.UserID, 10),
	}})
}

func (h *PostHandler) Quote(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		RepostOf   string `json:"repostOf"`
		Content    string `json:"content"`
		MediaCount int    `json:"mediaCount"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	repostOf, _ := strconv.ParseInt(body.RepostOf, 10, 64)
	post, err := service.CreateQuoteRepost(r.Context(), user.ID, repostOf, body.Content, body.MediaCount)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to quote repost")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"message": "Post quoted", "post": map[string]interface{}{
		"id": strconv.FormatInt(post.ID, 10), "userId": strconv.FormatInt(post.UserID, 10),
	}})
}

func (h *PostHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		PostID string `json:"postId"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}
	postID, _ := strconv.ParseInt(body.PostID, 10, 64)
	if !service.IsPostOwner(r.Context(), postID, user.ID) {
		util.Error(w, http.StatusForbidden, "Forbidden: Not your own post")
		return
	}
	post, err := service.DeletePost(r.Context(), postID, user.ID)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to delete post")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"message": "Post deleted", "post": map[string]interface{}{
		"id": strconv.FormatInt(post.ID, 10), "userId": strconv.FormatInt(post.UserID, 10),
	}})
}

func (h *PostHandler) GetByUsername(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	uid, err := service.GetUserIDByUsername(r.Context(), username)
	if err != nil {
		util.JSON(w, http.StatusOK, map[string]interface{}{"posts": []interface{}{}})
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 {
		limit = 20
	}

	rows, err := service.GetPostsByUserID(r.Context(), uid, limit, offset)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to get posts")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"posts": rows})
}

func (h *PostHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "postId")
	user := middleware.GetUser(r.Context())
	var uid *int64
	if user != nil {
		uid = &user.ID
	}

	post, err := service.GetPostWithThread(r.Context(), h.cfg, postID, uid)
	if err != nil {
		util.Error(w, http.StatusNotFound, "Post not found")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"post": post})
}
