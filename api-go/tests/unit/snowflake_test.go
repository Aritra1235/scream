package unit

import (
	"testing"
	"time"

	"github.com/Aritra1235/scream/api-go/internal/util"
	"github.com/stretchr/testify/assert"
)

func TestGenerateID(t *testing.T) {
	id := util.GenerateID()
	assert.Greater(t, id, int64(0))
}

func TestGenerateUniqueIDs(t *testing.T) {
	seen := make(map[int64]bool)
	for i := 0; i < 1000; i++ {
		id := util.GenerateID()
		assert.False(t, seen[id], "duplicate ID generated")
		seen[id] = true
	}
}

func TestGenerateMonotonicIDs(t *testing.T) {
	id1 := util.GenerateID()
	id2 := util.GenerateID()
	assert.Greater(t, id2, id1)
}

func TestParseID(t *testing.T) {
	before := time.Now()
	id := util.GenerateID()
	after := time.Now()

	ts, worker, seq := util.ParseID(id)
	assert.True(t, ts.After(before.Add(-time.Millisecond)) || ts.Equal(before))
	assert.True(t, ts.Before(after.Add(time.Millisecond)) || ts.Equal(after))
	assert.GreaterOrEqual(t, worker, int64(0))
	assert.GreaterOrEqual(t, seq, int64(0))
}

func TestSetWorkerID(t *testing.T) {
	util.SetWorkerID(42)
	id := util.GenerateID()
	_, worker, _ := util.ParseID(id)
	assert.Equal(t, int64(42), worker)
	util.SetWorkerID(1)
}

func TestSetWorkerIDPanicsOnInvalid(t *testing.T) {
	assert.Panics(t, func() { util.SetWorkerID(-1) })
	assert.Panics(t, func() { util.SetWorkerID(1024) })
}
