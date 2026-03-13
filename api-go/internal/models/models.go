package models

import "time"

type User struct {
	ID              int64      `json:"id,string"`
	Username        *string    `json:"username,omitempty"`
	DisplayName     *string    `json:"display_name,omitempty"`
	DisplayUsername  *string    `json:"displayUsername,omitempty"`
	Bio             *string    `json:"bio,omitempty"`
	AvatarURL       *string    `json:"avatar_url,omitempty"`
	BannerURL       *string    `json:"banner_url,omitempty"`
	Verified        bool       `json:"verified"`
	Name            *string    `json:"name,omitempty"`
	Email           string     `json:"email"`
	EmailVerified   bool       `json:"emailVerified"`
	Image           *string    `json:"image,omitempty"`
	Onboarded       bool       `json:"onboarded"`
	RegisteredFromIP *string   `json:"-"`
	LastLoginIP     *string    `json:"-"`
	LastActivityIP  *string    `json:"-"`
	FollowersCount  int        `json:"followers_count"`
	FollowingCount  int        `json:"following_count"`
	PostsCount      int        `json:"posts_count"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type Session struct {
	ID        int64     `json:"id,string"`
	UserID    int64     `json:"userId,string"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expiresAt"`
	IPAddress *string   `json:"ipAddress,omitempty"`
	UserAgent *string   `json:"userAgent,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Account struct {
	ID         int64   `json:"id,string"`
	UserID     int64   `json:"userId,string"`
	AccountID  string  `json:"accountId"`
	ProviderID string  `json:"providerId"`
	Password   *string `json:"-"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type Post struct {
	ID         int64     `json:"id,string"`
	UserID     int64     `json:"userId,string"`
	Content    string    `json:"content"`
	ParentID   *int64    `json:"parentId,string,omitempty"`
	RepostOf   *int64    `json:"repostOf,string,omitempty"`
	MediaCount int       `json:"mediaCount"`
	Visibility string    `json:"visibility"`
	LikesCount int       `json:"likes_count"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type Like struct {
	UserID    int64     `json:"userId,string"`
	PostID    int64     `json:"postId,string"`
	CreatedAt time.Time `json:"createdAt"`
}

type Follow struct {
	FollowerID  int64     `json:"followerId,string"`
	FollowingID int64     `json:"followingId,string"`
	CreatedAt   time.Time `json:"createdAt"`
}

type Media struct {
	ID          int64     `json:"id,string"`
	UserID      int64     `json:"userId,string"`
	TargetType  string    `json:"targetType"`
	TargetID    int64     `json:"targetId,string"`
	MediaURL    string    `json:"mediaUrl"`
	Type        string    `json:"type"`
	ContentType string    `json:"contentType"`
	Width       *int      `json:"width,omitempty"`
	Height      *int      `json:"height,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type Verification struct {
	ID         int64     `json:"id,string"`
	Identifier string    `json:"identifier"`
	Value      string    `json:"value"`
	ExpiresAt  time.Time `json:"expiresAt"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// API response types

type FeedAuthor struct {
	ID          string  `json:"id"`
	Username    *string `json:"username"`
	DisplayName *string `json:"display_name"`
	AvatarURL   *string `json:"avatar_url"`
	Verified    bool    `json:"verified"`
}

type FeedEngagement struct {
	Likes       int  `json:"likes"`
	Reposts     int  `json:"reposts"`
	Replies     int  `json:"replies"`
	LikedByUser bool `json:"liked_by_user"`
}

type FeedMedia struct {
	MediaURL    string `json:"mediaUrl"`
	Type        string `json:"type"`
	Width       *int   `json:"width"`
	Height      *int   `json:"height"`
	ContentType string `json:"contentType"`
}

type FeedPost struct {
	ID         string          `json:"id"`
	Content    string          `json:"content"`
	CreatedAt  time.Time       `json:"createdAt"`
	MediaCount int             `json:"mediaCount"`
	Media      []FeedMedia     `json:"media"`
	Author     FeedAuthor      `json:"author"`
	Engagement FeedEngagement  `json:"engagement"`
	ParentID   *string         `json:"parentId"`
	RepostOf   *FeedPost       `json:"repostOf,omitempty"`
	Replies    []FeedPost      `json:"replies,omitempty"`
}

type SuggestedUser struct {
	ID             string  `json:"id"`
	Username       *string `json:"username"`
	DisplayName    *string `json:"display_name"`
	AvatarURL      *string `json:"avatar_url"`
	Bio            *string `json:"bio"`
	Verified       bool    `json:"verified"`
	FollowersCount int     `json:"followers_count"`
	FollowingCount int     `json:"following_count"`
	MutualCount    int     `json:"mutualCount"`
}

type TrendingUser struct {
	SuggestedUser
	Score int `json:"score"`
}

type MutualFollower struct {
	ID          string  `json:"id"`
	Username    *string `json:"username"`
	DisplayName *string `json:"display_name"`
	AvatarURL   *string `json:"avatar_url"`
	Verified    bool    `json:"verified"`
}

type FollowUserInfo struct {
	ID             string  `json:"id"`
	Username       *string `json:"username"`
	DisplayName    *string `json:"display_name"`
	AvatarURL      *string `json:"avatar_url"`
	Bio            *string `json:"bio"`
	Verified       bool    `json:"verified"`
	FollowersCount int     `json:"followers_count"`
	FollowingCount int     `json:"following_count"`
}
