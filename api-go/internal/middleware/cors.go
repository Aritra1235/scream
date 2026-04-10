package middleware

import (
	"net/http"
	"strings"
)

// SkipAuthProxyCORS avoids stacking Go CORS headers on top of the upstream
// Better Auth server's own CORS headers for proxied auth routes.
func SkipAuthProxyCORS(corsMiddleware func(http.Handler) http.Handler) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		corsWrapped := corsMiddleware(next)

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if isAuthProxyPath(r.URL.Path) {
				next.ServeHTTP(w, r)
				return
			}

			corsWrapped.ServeHTTP(w, r)
		})
	}
}

func isAuthProxyPath(path string) bool {
	return path == "/api/auth" || strings.HasPrefix(path, "/api/auth/")
}
