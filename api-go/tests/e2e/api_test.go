package e2e

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const baseURL = "http://localhost:3002"

func newClient() *http.Client {
	jar, _ := cookiejar.New(nil)
	return &http.Client{Jar: jar}
}

func signIn(t *testing.T, client *http.Client) {
	t.Helper()
	resp, err := client.Post(baseURL+"/api/auth/sign-in/email",
		"application/json",
		strings.NewReader(`{"email":"test@example.com","password":"TestPassword123!"}`))
	require.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, 200, resp.StatusCode)
}

func parseJSON(t *testing.T, resp *http.Response) map[string]interface{} {
	t.Helper()
	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	return result
}

func TestHealthCheck(t *testing.T) {
	resp, err := http.Get(baseURL + "/")
	require.NoError(t, err)
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	assert.Equal(t, "Hello World!", string(body))
}

func TestAuthProxy(t *testing.T) {
	client := newClient()

	t.Run("sign in success", func(t *testing.T) {
		resp, err := client.Post(baseURL+"/api/auth/sign-in/email",
			"application/json",
			strings.NewReader(`{"email":"test@example.com","password":"TestPassword123!"}`))
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["user"])
	})

	t.Run("sign in failure", func(t *testing.T) {
		resp, _ := http.Post(baseURL+"/api/auth/sign-in/email",
			"application/json",
			strings.NewReader(`{"email":"test@example.com","password":"wrongpass"}`))
		defer resp.Body.Close()
		assert.NotEqual(t, 200, resp.StatusCode)
	})
}

func TestProfile(t *testing.T) {
	client := newClient()
	signIn(t, client)

	t.Run("get me", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/v1/profile/me")
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		user := data["user"].(map[string]interface{})
		assert.Equal(t, "test@example.com", user["email"])
	})

	t.Run("get by username", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/v1/profile/testuser")
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("get by username 404", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/profile/nonexistent999")
		defer resp.Body.Close()
		assert.Equal(t, 404, resp.StatusCode)
	})
}

func TestFeed(t *testing.T) {
	client := newClient()
	signIn(t, client)

	t.Run("get main feed", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/v1/feed?limit=5")
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		posts := data["posts"].([]interface{})
		assert.Greater(t, len(posts), 0)
	})

	t.Run("get following feed", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/v1/feed/following?limit=5")
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["posts"])
	})

	t.Run("get user feed", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/v1/feed/user/testuser?limit=5")
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("feed requires auth", func(t *testing.T) {
		resp, _ := http.Get(baseURL + "/api/v1/feed")
		defer resp.Body.Close()
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("post shape", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/feed?limit=1")
		defer resp.Body.Close()
		data := parseJSON(t, resp)
		posts := data["posts"].([]interface{})
		if len(posts) > 0 {
			post := posts[0].(map[string]interface{})
			assert.Contains(t, post, "id")
			assert.Contains(t, post, "content")
			assert.Contains(t, post, "author")
			assert.Contains(t, post, "engagement")
		}
	})
}

func TestPostCRUD(t *testing.T) {
	client := newClient()
	signIn(t, client)

	var createdPostID string

	t.Run("create post", func(t *testing.T) {
		resp, err := client.Post(baseURL+"/api/v1/post/create",
			"application/json",
			strings.NewReader(`{"content":"Go E2E test post","mediaCount":0}`))
		require.NoError(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.Equal(t, "Post created", data["message"])
		post := data["post"].(map[string]interface{})
		createdPostID = post["id"].(string)
	})

	t.Run("create reply", func(t *testing.T) {
		body := fmt.Sprintf(`{"parentId":"%s","content":"Go reply","mediaCount":0}`, createdPostID)
		resp, _ := client.Post(baseURL+"/api/v1/post/reply", "application/json", strings.NewReader(body))
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.Equal(t, "Reply created", data["message"])
	})

	t.Run("get post with thread", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/post/id/" + createdPostID)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("delete post", func(t *testing.T) {
		// Create a post to delete
		resp, _ := client.Post(baseURL+"/api/v1/post/create", "application/json",
			strings.NewReader(`{"content":"to delete","mediaCount":0}`))
		data := parseJSON(t, resp)
		resp.Body.Close()
		pid := data["post"].(map[string]interface{})["id"].(string)

		body := fmt.Sprintf(`{"postId":"%s"}`, pid)
		resp2, _ := client.Post(baseURL+"/api/v1/post/delete", "application/json", strings.NewReader(body))
		defer resp2.Body.Close()
		assert.Equal(t, 200, resp2.StatusCode)
	})

	t.Run("post requires auth", func(t *testing.T) {
		resp, _ := http.Post(baseURL+"/api/v1/post/create", "application/json",
			strings.NewReader(`{"content":"no auth","mediaCount":0}`))
		defer resp.Body.Close()
		assert.Equal(t, 401, resp.StatusCode)
	})
}

func TestFollow(t *testing.T) {
	client := newClient()
	signIn(t, client)

	t.Run("follow status", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/follow/status/2032384007164923904")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["isFollowing"])
	})

	t.Run("followers list", func(t *testing.T) {
		resp, _ := http.Get(baseURL + "/api/v1/followers/alice")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["followers"])
	})

	t.Run("following list", func(t *testing.T) {
		resp, _ := http.Get(baseURL + "/api/v1/following/testuser")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["following"])
	})

	t.Run("follow self rejected", func(t *testing.T) {
		resp, _ := client.Post(baseURL+"/api/v1/follow", "application/json",
			strings.NewReader(`{"targetUserId":"2032372199385468928"}`))
		defer resp.Body.Close()
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("follow requires auth", func(t *testing.T) {
		resp, _ := http.Post(baseURL+"/api/v1/follow", "application/json",
			strings.NewReader(`{"targetUserId":"2032384007164923904"}`))
		defer resp.Body.Close()
		assert.Equal(t, 401, resp.StatusCode)
	})
}

func TestGraph(t *testing.T) {
	client := newClient()
	signIn(t, client)

	t.Run("suggestions", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/graph/suggestions?limit=3")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["suggestions"])
	})

	t.Run("trending", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/graph/trending?limit=5")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		trending := data["trending"].([]interface{})
		assert.Greater(t, len(trending), 0)
	})

	t.Run("mutual followers", func(t *testing.T) {
		resp, _ := client.Get(baseURL + "/api/v1/graph/mutual/bob")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.NotNil(t, data["mutuals"])
	})
}

func TestOnboarding(t *testing.T) {
	t.Run("get status", func(t *testing.T) {
		resp, _ := http.Get(baseURL + "/api/v1/onboarding/2032372199385468928")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.Equal(t, true, data["onboarded"])
	})
}

func TestUsername(t *testing.T) {
	t.Run("taken username", func(t *testing.T) {
		resp, _ := http.Get(baseURL + "/api/v1/username/testuser")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.Equal(t, false, data["available"])
	})

	t.Run("available username", func(t *testing.T) {
		resp, _ := http.Get(baseURL + "/api/v1/username/nonexistent_user_xyz")
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		data := parseJSON(t, resp)
		assert.Equal(t, true, data["available"])
	})
}
