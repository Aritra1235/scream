package handler

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/Aritra1235/scream/api-go/internal/config"
)

func NewAuthProxy(cfg *config.Config) http.Handler {
	target, _ := url.Parse(cfg.BetterAuthURL)

	proxy := httputil.NewSingleHostReverseProxy(target)

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = target.Host
	}

	return proxy
}
