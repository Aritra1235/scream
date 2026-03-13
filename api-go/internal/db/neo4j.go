package db

import (
	"context"
	"log"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

var Neo4jDriver neo4j.DriverWithContext

func InitNeo4j(uri, user, password string) error {
	var err error
	Neo4jDriver, err = neo4j.NewDriverWithContext(uri, neo4j.BasicAuth(user, password, ""))
	if err != nil {
		return err
	}

	if err := Neo4jDriver.VerifyConnectivity(context.Background()); err != nil {
		log.Printf("[neo4j] Warning: connectivity check failed: %v", err)
		return nil
	}

	log.Println("[neo4j] Connected")
	return nil
}

func InitNeo4jSchema(ctx context.Context) {
	session := Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	queries := []string{
		"CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
		"CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE",
		"CREATE INDEX user_username IF NOT EXISTS FOR (u:User) ON (u.username)",
	}

	for _, q := range queries {
		if _, err := session.Run(ctx, q, nil); err != nil {
			log.Printf("[neo4j] Schema warning: %v", err)
		}
	}
	log.Println("[neo4j] Schema initialized")
}

func CloseNeo4j(ctx context.Context) {
	if Neo4jDriver != nil {
		Neo4jDriver.Close(ctx)
	}
}
