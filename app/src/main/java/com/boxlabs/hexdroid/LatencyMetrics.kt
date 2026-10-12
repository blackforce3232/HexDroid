package com.boxlabs.hexdroid

/** Bounded histograms: no message text, identifiers, or per-event sample lists are retained. */
internal class LatencyMetrics {
    data class Summary(
        val metric: String,
        val count: Long,
        val totalMs: Long,
        val maxMs: Long,
        val p95UpperMs: Long,
    ) {
        fun logLine(windowMs: Long): String =
            "window_ms=$windowMs metric=$metric count=$count avg_ms=${totalMs / count} " +
                "max_ms=$maxMs p95_upper_ms=$p95UpperMs"
    }

    private class Histogram {
        val buckets = LongArray(BOUNDS.size + 1)
        var count = 0L
        var total = 0L
        var max = 0L
    }

    private val metrics = linkedMapOf<String, Histogram>()

    /** Call only with fixed, code-defined metric names, never channel/nick/network names. */
    @Synchronized
    fun record(metric: String, durationMs: Long) {
        if (durationMs < 0) return
        val h = metrics.getOrPut(metric) { Histogram() }
        val bucket = BOUNDS.indexOfFirst { durationMs <= it }.let { if (it < 0) BOUNDS.size else it }
        h.buckets[bucket]++
        h.count++
        h.total += durationMs
        h.max = maxOf(h.max, durationMs)
    }

    /** Atomically detach a window; formatting and Logcat output happen outside this lock. */
    @Synchronized
    fun drain(): List<Summary> {
        val result = metrics.map { (name, h) ->
            val rank = h.count - h.count / 20 // ceil(count * .95), without floating point
            var cumulative = 0L
            val bucket = h.buckets.indexOfFirst {
                cumulative += it
                cumulative >= rank
            }
            Summary(name, h.count, h.total, h.max, BOUNDS.getOrElse(bucket) { h.max })
        }
        metrics.clear()
        return result
    }

    private companion object {
        val BOUNDS = longArrayOf(0, 1, 2, 4, 8, 16, 32, 64, 100, 250, 500, 1000, 2000, 4000, 8000, 16000)
    }
}
