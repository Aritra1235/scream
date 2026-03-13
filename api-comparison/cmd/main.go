package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/http/cookiejar"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

type Module struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Method   string `json:"method"`
	Body     string `json:"body,omitempty"`
	NeedAuth bool   `json:"needAuth"`
}

var defaultModules = []Module{
	{Name: "Health Check", Path: "/", Method: "GET", NeedAuth: false},
	{Name: "Feed", Path: "/api/v1/feed?limit=5", Method: "GET", NeedAuth: true},
	{Name: "Following Feed", Path: "/api/v1/feed/following?limit=5", Method: "GET", NeedAuth: true},
	{Name: "Profile (self)", Path: "/api/v1/profile/me", Method: "GET", NeedAuth: true},
	{Name: "Profile (public)", Path: "/api/v1/profile/testuser", Method: "GET", NeedAuth: false},
	{Name: "Followers", Path: "/api/v1/followers/alice", Method: "GET", NeedAuth: false},
	{Name: "Following", Path: "/api/v1/following/testuser", Method: "GET", NeedAuth: false},
	{Name: "Graph Trending", Path: "/api/v1/graph/trending?limit=5", Method: "GET", NeedAuth: true},
	{Name: "Onboarding", Path: "/api/v1/onboarding/2032372199385468928", Method: "GET", NeedAuth: false},
	{Name: "Username Check", Path: "/api/v1/username/testuser", Method: "GET", NeedAuth: false},
}

type BenchConfig struct {
	GlobalRequests int            `json:"globalRequests"`
	ModuleRequests map[string]int `json:"moduleRequests"`
	Concurrency    int            `json:"concurrency"`
}

type RequestResult struct {
	LatencyMs float64 `json:"latencyMs"`
	StatusOK  bool    `json:"statusOk"`
}

type ModuleResult struct {
	Module     string    `json:"module"`
	Backend    string    `json:"backend"`
	ReqIndex   int       `json:"reqIndex"`
	Total      int       `json:"total"`
	LatencyMs  float64   `json:"latencyMs"`
	StatusOK   bool      `json:"statusOk"`
	Timestamp  time.Time `json:"timestamp"`
}

type ModuleStats struct {
	Module         string    `json:"module"`
	Backend        string    `json:"backend"`
	TotalRequests  int       `json:"totalRequests"`
	Successful     int       `json:"successful"`
	Failed         int       `json:"failed"`
	TotalTimeMs    float64   `json:"totalTimeMs"`
	MeanMs         float64   `json:"meanMs"`
	MedianMs       float64   `json:"medianMs"`
	P50Ms          float64   `json:"p50Ms"`
	P90Ms          float64   `json:"p90Ms"`
	P95Ms          float64   `json:"p95Ms"`
	P99Ms          float64   `json:"p99Ms"`
	MinMs          float64   `json:"minMs"`
	MaxMs          float64   `json:"maxMs"`
	StdDevMs       float64   `json:"stdDevMs"`
	ReqPerSec      float64   `json:"reqPerSec"`
	Latencies      []float64 `json:"latencies"`
}

type RunResult struct {
	ID        string        `json:"id"`
	StartedAt time.Time     `json:"startedAt"`
	Config    BenchConfig   `json:"config"`
	Stats     []ModuleStats `json:"stats"`
}

var (
	activeMu   sync.Mutex
	sseClients = make(map[chan []byte]bool)
	running    int32
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", serveUI)
	mux.HandleFunc("/api/modules", handleModules)
	mux.HandleFunc("/api/run", handleRun)
	mux.HandleFunc("/api/events", handleSSE)
	mux.HandleFunc("/api/results", handleResults)

	port := "3010"
	if p := os.Getenv("BENCH_PORT"); p != "" {
		port = p
	}
	log.Printf("Benchmark dashboard at http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func handleModules(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(defaultModules)
}

func handleRun(w http.ResponseWriter, r *http.Request) {
	if !atomic.CompareAndSwapInt32(&running, 0, 1) {
		http.Error(w, `{"error":"benchmark already running"}`, http.StatusConflict)
		return
	}

	var cfg BenchConfig
	json.NewDecoder(r.Body).Decode(&cfg)
	if cfg.GlobalRequests <= 0 {
		cfg.GlobalRequests = 100
	}
	if cfg.Concurrency <= 0 {
		cfg.Concurrency = 10
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "started"})

	go func() {
		defer atomic.StoreInt32(&running, 0)
		runBenchmark(cfg)
	}()
}

func handleSSE(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming not supported", 500)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ch := make(chan []byte, 1000)
	activeMu.Lock()
	sseClients[ch] = true
	activeMu.Unlock()

	defer func() {
		activeMu.Lock()
		delete(sseClients, ch)
		activeMu.Unlock()
	}()

	for {
		select {
		case msg := <-ch:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}

func broadcast(eventType string, data interface{}) {
	payload, _ := json.Marshal(map[string]interface{}{"type": eventType, "data": data})
	activeMu.Lock()
	for ch := range sseClients {
		select {
		case ch <- payload:
		default:
		}
	}
	activeMu.Unlock()
}

func handleResults(w http.ResponseWriter, r *http.Request) {
	dir := "results"
	files, _ := os.ReadDir(dir)
	var results []string
	for _, f := range files {
		if strings.HasSuffix(f.Name(), ".json") {
			results = append(results, f.Name())
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func signIn(baseURL string) *http.Client {
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar, Timeout: 30 * time.Second}
	resp, err := client.Post(baseURL+"/api/auth/sign-in/email",
		"application/json",
		strings.NewReader(`{"email":"test@example.com","password":"TestPassword123!"}`))
	if err != nil {
		log.Printf("Sign-in failed for %s: %v", baseURL, err)
		return client
	}
	io.ReadAll(resp.Body)
	resp.Body.Close()
	return client
}

func runBenchmark(cfg BenchConfig) {
	broadcast("status", map[string]string{"phase": "signing_in"})

	bunClient := signIn("http://localhost:3000")
	goClient := signIn("http://localhost:3002")
	noAuthClient := &http.Client{Timeout: 30 * time.Second}

	runID := time.Now().Format("20060102_150405")
	result := RunResult{
		ID:        runID,
		StartedAt: time.Now(),
		Config:    cfg,
	}

	broadcast("status", map[string]string{"phase": "running"})

	backends := []struct {
		name    string
		baseURL string
		auth    *http.Client
		noAuth  *http.Client
	}{
		{"Bun/Elysia", "http://localhost:3000", bunClient, noAuthClient},
		{"Go/Chi", "http://localhost:3002", goClient, noAuthClient},
	}

	for _, mod := range defaultModules {
		numReqs := cfg.GlobalRequests
		if v, ok := cfg.ModuleRequests[mod.Name]; ok && v > 0 {
			numReqs = v
		}

		for _, be := range backends {
			client := be.noAuth
			if mod.NeedAuth {
				client = be.auth
			}

			url := be.baseURL + mod.Path
			latencies := make([]float64, 0, numReqs)
			var mu sync.Mutex
			var successCount, failCount int64

			broadcast("module_start", map[string]interface{}{
				"module": mod.Name, "backend": be.name, "total": numReqs,
			})

			sem := make(chan struct{}, cfg.Concurrency)
			var wg sync.WaitGroup
			startTime := time.Now()

			for i := 0; i < numReqs; i++ {
				wg.Add(1)
				sem <- struct{}{}
				go func(idx int) {
					defer wg.Done()
					defer func() { <-sem }()

					var req *http.Request
					if mod.Method == "POST" && mod.Body != "" {
						req, _ = http.NewRequest("POST", url, strings.NewReader(mod.Body))
						req.Header.Set("Content-Type", "application/json")
					} else {
						req, _ = http.NewRequest("GET", url, nil)
					}

					t0 := time.Now()
					resp, err := client.Do(req)
					latency := float64(time.Since(t0).Microseconds()) / 1000.0

					ok := err == nil && resp != nil && resp.StatusCode >= 200 && resp.StatusCode < 400
					if resp != nil {
						io.ReadAll(resp.Body)
						resp.Body.Close()
					}

					mu.Lock()
					latencies = append(latencies, latency)
					if ok {
						atomic.AddInt64(&successCount, 1)
					} else {
						atomic.AddInt64(&failCount, 1)
					}
					mu.Unlock()

					// Send every result for live chart (throttle for huge runs)
					if numReqs <= 10000 || idx%10 == 0 {
						broadcast("result", ModuleResult{
							Module: mod.Name, Backend: be.name,
							ReqIndex: idx + 1, Total: numReqs,
							LatencyMs: latency, StatusOK: ok,
							Timestamp: time.Now(),
						})
					}
				}(i)
			}

			wg.Wait()
			elapsed := time.Since(startTime)

			stats := computeStats(mod.Name, be.name, latencies, int(successCount), int(failCount), elapsed)
			result.Stats = append(result.Stats, stats)

			broadcast("module_done", stats)
		}
	}

	// Save results
	saveResults(result)
	broadcast("status", map[string]string{"phase": "done", "runId": runID})
}

func computeStats(module, backend string, latencies []float64, success, failed int, elapsed time.Duration) ModuleStats {
	sort.Float64s(latencies)
	n := len(latencies)
	if n == 0 {
		return ModuleStats{Module: module, Backend: backend}
	}

	var sum float64
	for _, l := range latencies {
		sum += l
	}
	mean := sum / float64(n)

	var sqDiffSum float64
	for _, l := range latencies {
		d := l - mean
		sqDiffSum += d * d
	}
	stdDev := math.Sqrt(sqDiffSum / float64(n))

	percentile := func(p float64) float64 {
		idx := int(math.Ceil(p/100.0*float64(n))) - 1
		if idx < 0 { idx = 0 }
		if idx >= n { idx = n - 1 }
		return latencies[idx]
	}

	return ModuleStats{
		Module:        module,
		Backend:       backend,
		TotalRequests: n,
		Successful:    success,
		Failed:        failed,
		TotalTimeMs:   float64(elapsed.Milliseconds()),
		MeanMs:        math.Round(mean*100) / 100,
		MedianMs:      math.Round(percentile(50)*100) / 100,
		P50Ms:         math.Round(percentile(50)*100) / 100,
		P90Ms:         math.Round(percentile(90)*100) / 100,
		P95Ms:         math.Round(percentile(95)*100) / 100,
		P99Ms:         math.Round(percentile(99)*100) / 100,
		MinMs:         math.Round(latencies[0]*100) / 100,
		MaxMs:         math.Round(latencies[n-1]*100) / 100,
		StdDevMs:      math.Round(stdDev*100) / 100,
		ReqPerSec:     math.Round(float64(n)/elapsed.Seconds()*100) / 100,
		Latencies:     latencies,
	}
}

func saveResults(result RunResult) {
	os.MkdirAll("results", 0755)
	path := filepath.Join("results", fmt.Sprintf("run_%s.json", result.ID))

	// Strip raw latencies from saved file to keep size manageable for huge runs
	stripped := result
	for i := range stripped.Stats {
		if len(stripped.Stats[i].Latencies) > 10000 {
			stripped.Stats[i].Latencies = stripped.Stats[i].Latencies[:10000]
		}
	}

	f, err := os.Create(path)
	if err != nil {
		log.Printf("Failed to save results: %v", err)
		return
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	enc.Encode(stripped)
	log.Printf("Results saved to %s", path)
}

func serveUI(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	fmt.Fprint(w, dashboardHTML)
}
