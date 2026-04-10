package service

import (
	"strings"

	"github.com/Aritra1235/scream/api-go/internal/config"
)

func buildAssetURL(cfg *config.Config, path string) string {
	base := strings.TrimRight(cfg.AWSS3BucketName, "/")
	trimmedPath := strings.TrimLeft(path, "/")
	if base == "" {
		return "/" + trimmedPath
	}
	return base + "/" + trimmedPath
}

func buildOptionalAssetURL(cfg *config.Config, path *string) *string {
	if path == nil {
		return nil
	}
	value := buildAssetURL(cfg, *path)
	return &value
}
