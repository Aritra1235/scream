.PHONY: build run test test-unit test-e2e clean

build:
	go build -o bin/server ./cmd/server

run: build
	./bin/server

dev:
	go run ./cmd/server

test:
	go test ./tests/... -v -count=1

test-unit:
	go test ./tests/unit/... -v -count=1

test-e2e:
	go test ./tests/e2e/... -v -count=1

clean:
	rm -rf bin/
