package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/Aritra1235/scream/api-go/internal/middleware"
	"github.com/Aritra1235/scream/api-go/internal/service"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

type OnboardingHandler struct{}

func NewOnboardingHandler() *OnboardingHandler { return &OnboardingHandler{} }

func (h *OnboardingHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userId")
	status, err := service.GetOnboardingStatus(r.Context(), userID)
	if err != nil {
		util.Error(w, http.StatusNotFound, "User not found")
		return
	}
	util.JSON(w, http.StatusOK, status)
}

func (h *OnboardingHandler) Complete(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	var body struct {
		Username    string  `json:"username"`
		DisplayName string  `json:"display_name"`
		Bio         *string `json:"bio"`
		AvatarURL   *string `json:"avatar_url"`
		BannerURL   *string `json:"banner_url"`
	}
	if err := util.DecodeBody(r, &body); err != nil {
		util.Error(w, http.StatusBadRequest, "Invalid body")
		return
	}

	if body.Username == "" || body.DisplayName == "" {
		util.Error(w, http.StatusBadRequest, "Username and display name are required")
		return
	}

	err := service.CompleteOnboarding(r.Context(), user.ID, body.Username, body.DisplayName, body.Bio, body.AvatarURL, body.BannerURL)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "Failed to complete onboarding")
		return
	}

	util.JSON(w, http.StatusOK, map[string]string{"message": "Onboarding complete"})
}
