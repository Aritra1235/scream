package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       int
	DatabaseURL string

	Neo4jURI      string
	Neo4jUser     string
	Neo4jPassword string

	BetterAuthSecret string
	BetterAuthURL    string

	WebURL             string
	CORSOrigins        []string
	TrustedOrigins     []string

	CDNBaseURL       string
	DefaultAvatar    string
	DefaultBanner    string

	AWSEndpoint        string
	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSS3BucketName    string

	MailgunAPIKey  string
	MailgunDomain  string
	DontSendEmail  bool
}

func Load() *Config {
	_ = godotenv.Load()

	port, _ := strconv.Atoi(getEnv("PORT", "3000"))

	corsOrigins := parseCSV(getEnv("CORS_ORIGINS", "http://localhost:3001"))
	webURL := getEnv("WEB_URL", "http://localhost:3001")

	return &Config{
		Port:        port,
		DatabaseURL: getEnv("DATABASE_URL", "postgresql://devuser:devpass@localhost:5432/twitclone"),

		Neo4jURI:      getEnv("NEO4J_URI", "bolt://localhost:7687"),
		Neo4jUser:     getEnv("NEO4J_USER", "neo4j"),
		Neo4jPassword: getEnv("NEO4J_PASSWORD", "neo4jdev"),

		BetterAuthSecret: getEnv("BETTER_AUTH_SECRET", "dev-secret-key-for-local-development-only-1234567890"),
		BetterAuthURL:    getEnv("BETTER_AUTH_URL", "http://localhost:3000"),

		WebURL:         webURL,
		CORSOrigins:    corsOrigins,
		TrustedOrigins: append(corsOrigins, webURL),

		CDNBaseURL:    getEnv("CDN_BASE_URL", "http://localhost:3000/static"),
		DefaultAvatar: getEnv("DEFAULT_AVATAR_OBJECT", "default-avatar.png"),
		DefaultBanner: getEnv("DEFAULT_BANNER_OBJECT", "default-banner.png"),

		AWSEndpoint:        getEnv("AWS_ENDPOINT", ""),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSS3BucketName:    getEnv("AWS_S3_BUCKET_NAME", ""),

		MailgunAPIKey: getEnv("MAILGUN_API_KEY", ""),
		MailgunDomain: getEnv("MAILGUN_DOMAIN", ""),
		DontSendEmail: getEnv("DONT_SEND_EMAIL", "true") == "true",
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
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
