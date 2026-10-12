package com.boxlabs.hexdroid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LatencyMetricsTest {
    @Test fun summarizesAndResetsWindow() {
        val metrics = LatencyMetrics()
        metrics.record("handler", 0)
        metrics.record("handler", 10)
        val summary = metrics.drain().single()
        assertEquals(2L, summary.count)
        assertEquals(10L, summary.totalMs)
        assertEquals(10L, summary.maxMs)
        assertEquals(16L, summary.p95UpperMs)
        assertTrue(metrics.drain().isEmpty())
    }

    @Test fun percentileUsesNearestRankAndIncludesOverflow() {
        val metrics = LatencyMetrics()
        repeat(19) { metrics.record("queue", 100) }
        metrics.record("queue", 20_000)
        assertEquals(100L, metrics.drain().single().p95UpperMs)
        metrics.record("queue", 20_000)
        assertEquals(20_000L, metrics.drain().single().p95UpperMs)
    }

    @Test fun rejectsNegativeDurationsAndKeepsMetricsSeparate() {
        val metrics = LatencyMetrics()
        metrics.record("invalid", -1)
        metrics.record("main", 1)
        metrics.record("handler", 2)
        val summaries = metrics.drain()
        assertEquals(listOf("main", "handler"), summaries.map { it.metric })
        assertEquals(1L, summaries[0].maxMs)
        assertEquals(2L, summaries[1].maxMs)
    }

    @Test fun concurrentRecordsAreNotLost() {
        val metrics = LatencyMetrics()
        val threads = List(4) { Thread { repeat(1000) { metrics.record("handler", 2) } } }
        threads.forEach { it.start() }
        threads.forEach { it.join() }
        val summary = metrics.drain().single()
        assertEquals(4000L, summary.count)
        assertEquals(8000L, summary.totalMs)
    }
}
