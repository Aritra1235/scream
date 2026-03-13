package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/Aritra1235/scream/api-go/internal/db"
	"github.com/Aritra1235/scream/api-go/internal/util"
)

type UsernameHandler struct{}

func NewUsernameHandler() *UsernameHandler { return &UsernameHandler{} }

func (h *UsernameHandler) CheckAvailability(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	var exists bool
	db.Pool.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM "user" WHERE username = $1)`, username).Scan(&exists)
	util.JSON(w, http.StatusOK, map[string]interface{}{
		"username":  username,
		"available": !exists,
	})
}
