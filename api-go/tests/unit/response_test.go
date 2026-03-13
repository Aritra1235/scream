package unit

import (
	"net/http/httptest"
	"testing"

	"github.com/Aritra1235/scream/api-go/internal/util"
	"github.com/stretchr/testify/assert"
)

func TestJSON(t *testing.T) {
	w := httptest.NewRecorder()
	util.JSON(w, 200, map[string]string{"hello": "world"})

	assert.Equal(t, 200, w.Code)
	assert.Contains(t, w.Header().Get("Content-Type"), "application/json")
	assert.Contains(t, w.Body.String(), `"hello":"world"`)
}

func TestError(t *testing.T) {
	w := httptest.NewRecorder()
	util.Error(w, 400, "bad request")

	assert.Equal(t, 400, w.Code)
	assert.Contains(t, w.Body.String(), `"message":"bad request"`)
}

func TestStringPtr(t *testing.T) {
	p := util.StringPtr("hello")
	assert.NotNil(t, p)
	assert.Equal(t, "hello", *p)
}

func TestInt64Ptr(t *testing.T) {
	p := util.Int64Ptr(42)
	assert.NotNil(t, p)
	assert.Equal(t, int64(42), *p)
}

func TestParseInt64(t *testing.T) {
	var dst int64
	_, err := util.ParseInt64("12345", &dst)
	assert.NoError(t, err)
	assert.Equal(t, int64(12345), dst)

	_, err = util.ParseInt64("notanumber", &dst)
	assert.Error(t, err)
}
