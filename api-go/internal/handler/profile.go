package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/Aritra1235/scream/api-go/internal/middleware"
	"github.com/Aritra1235/scream/api-go/internal/service"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

type ProfileHandler struct {
	cfg *config.Config
}

func NewProfileHandler(cfg *config.Config) *ProfileHandler {
	return &ProfileHandler{cfg: cfg}
}

func (h *ProfileHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if !user.EmailVerified {
		util.Error(w, http.StatusForbidden, "Email not verified")
		return
	}
	u, err := service.GetUserByID(r.Context(), h.cfg, user.ID)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to fetch user")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"user": u})
}

func (h *ProfileHandler) GetByUsername(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	u, err := service.GetUserByUsername(r.Context(), h.cfg, username)
	if err != nil {
		util.Error(w, http.StatusNotFound, "User not found")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"user": u})
}

func (h *ProfileHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userId")
	var id int64
	if _, err := util.ParseInt64(userID, &id); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	u, err := service.GetUserByID(r.Context(), h.cfg, id)
	if err != nil {
		util.Error(w, http.StatusNotFound, "User not found")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"user": u})
}

func (h *ProfileHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if !user.EmailVerified {
		util.Error(w, http.StatusForbidden, "Email not verified")
		return
	}

	var body struct {
		DisplayName *string `json:"display_name"`
		Username    *string `json:"username"`
		AvatarURL   *string `json:"avatar_url"`
		BannerURL   *string `json:"banner_url"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}

	u, err := service.UpdateProfile(r.Context(), h.cfg, user.ID, body.DisplayName, body.Username, body.AvatarURL, body.BannerURL)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to update profile")
		return
	}
	util.JSON(w, http.StatusOK, map[string]interface{}{"user": u})
}
