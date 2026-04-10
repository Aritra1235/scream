package unit

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/Aritra1235/scream/api-go/internal/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func writeEnvFile(t *testing.T, body string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), ".env")
	require.NoError(t, os.WriteFile(path, []byte(body), 0o600))
	return path
}

func TestConfigDefaults(t *testing.T) {
	t.Setenv("SCREAM_ENV_FILE", writeEnvFile(t, "DATABASE_URL=postgresql://default:user@localhost:5432/scream\nBETTER_AUTH_URL=http://localhost:3000\nNEO4J_URI=bolt://localhost:7687\nNEO4J_USER=neo4j\n"))
	t.Setenv("PORT", "")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("NEO4J_URI", "")
	t.Setenv("NEO4J_USER", "")
	t.Setenv("NEO4J_PASSWORD", "")
	t.Setenv("BETTER_AUTH_URL", "")
	t.Setenv("BETTER_AUTH_SECRET", "")
	t.Setenv("DONT_SEND_EMAIL", "")

	cfg, err := config.Load()
	require.NoError(t, err)

	assert.Equal(t, 3002, cfg.Port)
	assert.Contains(t, cfg.DatabaseURL, "postgresql://")
	assert.Equal(t, "bolt://localhost:7687", cfg.Neo4jURI)
	assert.Equal(t, "neo4j", cfg.Neo4jUser)
	assert.False(t, cfg.DontSendEmail)
}

func TestConfigFromEnv(t *testing.T) {
	t.Setenv("SCREAM_ENV_FILE", writeEnvFile(t, "DATABASE_URL=postgresql://default:user@localhost:5432/scream\nBETTER_AUTH_URL=http://localhost:3000\n"))
	t.Setenv("PORT", "9999")
	t.Setenv("DATABASE_URL", "postgresql://test:test@localhost/testdb")
	t.Setenv("NEO4J_URI", "bolt://neo4j:7687")
	t.Setenv("DONT_SEND_EMAIL", "false")

	cfg, err := config.Load()
	require.NoError(t, err)
	assert.Equal(t, 9999, cfg.Port)
	assert.Equal(t, "postgresql://test:test@localhost/testdb", cfg.DatabaseURL)
	assert.Equal(t, "bolt://neo4j:7687", cfg.Neo4jURI)
	assert.False(t, cfg.DontSendEmail)
}

func TestCORSOriginsParsing(t *testing.T) {
	t.Setenv("SCREAM_ENV_FILE", writeEnvFile(t, "DATABASE_URL=postgresql://default:user@localhost:5432/scream\nBETTER_AUTH_URL=http://localhost:3000\n"))
	t.Setenv("CORS_ORIGINS", "http://localhost:3001,https://app.example.com")

	cfg, err := config.Load()
	require.NoError(t, err)
	assert.Contains(t, cfg.CORSOrigins, "http://localhost:3001")
	assert.Contains(t, cfg.CORSOrigins, "https://app.example.com")
}

func TestConfigLoadsExplicitDotEnvFile(t *testing.T) {
	dir := t.TempDir()
	envPath := filepath.Join(dir, ".env")
	require.NoError(t, os.WriteFile(envPath, []byte("PORT=4567\nDATABASE_URL=postgresql://env:file@localhost:5432/scream\nBETTER_AUTH_URL=http://localhost:3000\n"), 0o600))

	t.Setenv("SCREAM_ENV_FILE", envPath)
	t.Setenv("PORT", "")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("BETTER_AUTH_URL", "")

	cfg, err := config.Load()
	require.NoError(t, err)
	assert.Equal(t, 4567, cfg.Port)
	assert.Equal(t, "postgresql://env:file@localhost:5432/scream", cfg.DatabaseURL)
	assert.Equal(t, "http://localhost:3000", cfg.BetterAuthURL)
}
