package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

const envFileOverride = "SCREAM_ENV_FILE"

type Config struct {
	Port        int
	DatabaseURL string

	Neo4jURI      string
	Neo4jUser     string
	Neo4jPassword string

	BetterAuthSecret string
	BetterAuthURL    string

	WebURL         string
	CORSOrigins    []string
	TrustedOrigins []string

	CDNBaseURL    string
	DefaultAvatar string
	DefaultBanner string

	AWSEndpoint        string
	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSS3BucketName    string

	MailgunAPIKey string
	MailgunDomain string
	DontSendEmail bool
}

func Load() (*Config, error) {
	if err := loadDotEnv(); err != nil {
		return nil, err
	}

	port, err := getEnvInt("PORT", 3000)
	if err != nil {
		return nil, err
	}

	dontSendEmail, err := getEnvBool("DONT_SEND_EMAIL", false)
	if err != nil {
		return nil, err
	}

	webURL := firstNonEmptyEnv("WEB_URL")
	webURLs := parseCSV(firstNonEmptyEnv("WEB_URLS"))
	if webURL == "" && len(webURLs) > 0 {
		webURL = webURLs[0]
	}

	corsOrigins := parseCSV(firstNonEmptyEnv("CORS_ORIGINS", "CORS_ALLOWED_ORIGINS"))
	if len(corsOrigins) == 0 {
		corsOrigins = append(corsOrigins, webURLs...)
	}
	if len(corsOrigins) == 0 && webURL != "" {
		corsOrigins = append(corsOrigins, webURL)
	}

	trustedOrigins := uniqueStrings(
		corsOrigins,
		[]string{webURL},
		parseCSV(firstNonEmptyEnv("BETTER_AUTH_TRUSTED_ORIGINS")),
		parseCSV(firstNonEmptyEnv("BETTER_AUTH_URLS")),
		[]string{firstNonEmptyEnv("BETTER_AUTH_BASE_URL", "BETTER_AUTH_URL")},
	)

	cfg := &Config{
		Port:        port,
		DatabaseURL: firstNonEmptyEnv("DATABASE_URL"),

		Neo4jURI:      firstNonEmptyEnv("NEO4J_URI"),
		Neo4jUser:     firstNonEmptyEnv("NEO4J_USER"),
		Neo4jPassword: firstNonEmptyEnv("NEO4J_PASSWORD"),

		BetterAuthSecret: firstNonEmptyEnv("BETTER_AUTH_SECRET"),
		BetterAuthURL:    firstNonEmptyEnv("BETTER_AUTH_URL", "BETTER_AUTH_BASE_URL"),

		WebURL:         webURL,
		CORSOrigins:    corsOrigins,
		TrustedOrigins: trustedOrigins,

		CDNBaseURL:    firstNonEmptyEnv("CDN_BASE_URL"),
		DefaultAvatar: firstNonEmptyEnv("DEFAULT_AVATAR_OBJECT"),
		DefaultBanner: firstNonEmptyEnv("DEFAULT_BANNER_OBJECT"),

		AWSEndpoint:        firstNonEmptyEnv("AWS_ENDPOINT"),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKeyID:     firstNonEmptyEnv("AWS_ACCESS_KEY_ID"),
		AWSSecretAccessKey: firstNonEmptyEnv("AWS_SECRET_ACCESS_KEY"),
		AWSS3BucketName:    firstNonEmptyEnv("AWS_S3_BUCKET_NAME"),

		MailgunAPIKey: firstNonEmptyEnv("MAILGUN_API_KEY"),
		MailgunDomain: firstNonEmptyEnv("MAILGUN_DOMAIN"),
		DontSendEmail: dontSendEmail,
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.BetterAuthURL == "" {
		return nil, fmt.Errorf("BETTER_AUTH_URL is required")
	}

	return cfg, nil
}

func loadDotEnv() error {
	if customPath := os.Getenv(envFileOverride); customPath != "" {
		return loadEnvFile(customPath)
	}

	for _, candidate := range envFileCandidates() {
		if candidate == "" || !fileExists(candidate) {
			continue
		}
		return loadEnvFile(candidate)
	}

	return nil
}

func loadEnvFile(path string) error {
	values, err := godotenv.Read(path)
	if err != nil {
		return fmt.Errorf("load %s: %w", path, err)
	}
	for key, value := range values {
		if current, ok := os.LookupEnv(key); ok && current != "" {
			continue
		}
		if err := os.Setenv(key, value); err != nil {
			return fmt.Errorf("set %s from %s: %w", key, path, err)
		}
	}
	return nil
}

func envFileCandidates() []string {
	seen := make(map[string]struct{})
	var candidates []string

	add := func(path string) {
		if path == "" {
			return
		}
		absPath, err := filepath.Abs(path)
		if err != nil {
			return
		}
		if _, ok := seen[absPath]; ok {
			return
		}
		seen[absPath] = struct{}{}
		candidates = append(candidates, absPath)
	}

	add(".env")
	add(filepath.Join("api-go", ".env"))

	if exePath, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exePath)
		add(filepath.Join(exeDir, ".env"))
		add(filepath.Join(exeDir, "..", ".env"))
		add(filepath.Join(exeDir, "..", "api-go", ".env"))
	}

	return candidates
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func firstNonEmptyEnv(keys ...string) string {
	for _, key := range keys {
		if val := os.Getenv(key); val != "" {
			return val
		}
	}
	return ""
}

func getEnvInt(key string, fallback int) (int, error) {
	val := os.Getenv(key)
	if val == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		return 0, fmt.Errorf("invalid %s value %q: %w", key, val, err)
	}
	return parsed, nil
}

func getEnvBool(key string, fallback bool) (bool, error) {
	val := os.Getenv(key)
	if val == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseBool(val)
	if err != nil {
		return false, fmt.Errorf("invalid %s value %q: %w", key, val, err)
	}
	return parsed, nil
}

func parseCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func uniqueStrings(groups ...[]string) []string {
	seen := make(map[string]struct{})
	result := make([]string, 0)
	for _, group := range groups {
		for _, item := range group {
			trimmed := strings.TrimSpace(item)
			if trimmed == "" {
				continue
			}
			if _, ok := seen[trimmed]; ok {
				continue
			}
			seen[trimmed] = struct{}{}
			result = append(result, trimmed)
		}
	}
	return result
}
