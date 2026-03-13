package unit

import (
	"os"
	"testing"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/stretchr/testify/assert"
)

func TestConfigDefaults(t *testing.T) {
	os.Clearenv()
	cfg := config.Load()

	assert.Equal(t, 3000, cfg.Port)
	assert.Contains(t, cfg.DatabaseURL, "postgresql://")
	assert.Equal(t, "bolt://localhost:7687", cfg.Neo4jURI)
	assert.Equal(t, "neo4j", cfg.Neo4jUser)
	assert.True(t, cfg.DontSendEmail)
}

func TestConfigFromEnv(t *testing.T) {
	os.Setenv("PORT", "9999")
	os.Setenv("DATABASE_URL", "postgresql://test:test@localhost/testdb")
	os.Setenv("NEO4J_URI", "bolt://neo4j:7687")
	os.Setenv("DONT_SEND_EMAIL", "false")
	defer func() {
		os.Unsetenv("PORT")
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("NEO4J_URI")
		os.Unsetenv("DONT_SEND_EMAIL")
	}()

	cfg := config.Load()
	assert.Equal(t, 9999, cfg.Port)
	assert.Equal(t, "postgresql://test:test@localhost/testdb", cfg.DatabaseURL)
	assert.Equal(t, "bolt://neo4j:7687", cfg.Neo4jURI)
	assert.False(t, cfg.DontSendEmail)
}

func TestCORSOriginsParsing(t *testing.T) {
	os.Setenv("CORS_ORIGINS", "http://localhost:3001,https://app.example.com")
	defer os.Unsetenv("CORS_ORIGINS")

	cfg := config.Load()
	assert.Contains(t, cfg.CORSOrigins, "http://localhost:3001")
	assert.Contains(t, cfg.CORSOrigins, "https://app.example.com")
}
