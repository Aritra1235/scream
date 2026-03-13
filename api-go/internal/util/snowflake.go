package util

import (
	"sync"
	"time"
)

const (
	epoch           = int64(1288834974657) // Custom epoch (Nov 4, 2010)
	workerIDBits    = 10
	sequenceBits    = 12
	maxWorkerID     = (1 << workerIDBits) - 1
	maxSequence     = (1 << sequenceBits) - 1
	workerIDShift   = sequenceBits
	timestampShift  = workerIDBits + sequenceBits
)

var (
	mu            sync.Mutex
	lastTimestamp int64 = -1
	workerID      int64 = 1
	sequence      int64 = 0
)

func GenerateID() int64 {
	mu.Lock()
	defer mu.Unlock()

	now := time.Now().UnixMilli()

	if now == lastTimestamp {
		sequence = (sequence + 1) & maxSequence
		if sequence == 0 {
			for now <= lastTimestamp {
				now = time.Now().UnixMilli()
			}
		}
	} else {
		sequence = 0
	}

	lastTimestamp = now

	return ((now - epoch) << timestampShift) | (workerID << workerIDShift) | sequence
}

func SetWorkerID(id int64) {
	mu.Lock()
	defer mu.Unlock()
	if id < 0 || id > maxWorkerID {
		panic("worker ID out of range")
	}
	workerID = id
}

func ParseID(id int64) (timestamp time.Time, worker int64, seq int64) {
	ts := (id >> timestampShift) + epoch
	worker = (id >> workerIDShift) & maxWorkerID
	seq = id & maxSequence
	return time.UnixMilli(ts), worker, seq
}
