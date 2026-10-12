package com.boxlabs.hexdroid

import org.junit.Assert.assertEquals
import org.junit.Test

class LatencyEventClassifierTest {
    @Test fun labelsKnownHighVolumeEventsWithoutOther() {
        assertEquals("Joined", latencyEventKind(IrcEvent.Joined("#x", "nick")))
        assertEquals("Parted", latencyEventKind(IrcEvent.Parted("#x", "nick")))
        assertEquals("Kicked", latencyEventKind(IrcEvent.Kicked("#x", "nick", "me")))
        assertEquals("TypingStatus", latencyEventKind(IrcEvent.TypingStatus("nick", "#x", true)))
        assertEquals("ServerText", latencyEventKind(IrcEvent.ServerText("text")))
    }

    @Test fun labelsChatByHistoryStatus() {
        assertEquals("ChatLive", latencyEventKind(IrcEvent.ChatMessage("n", "#x", "t", false)))
        assertEquals("ChatHistory", latencyEventKind(IrcEvent.ChatMessage("n", "#x", "t", false, isHistory = true)))
    }
}
