package com.boxlabs.hexdroid

import org.junit.Assert.assertEquals
import org.junit.Test
import kotlin.random.Random

class NickListOrderingTest {
    private fun rank(display: String, modes: String, symbols: String): Int {
        val present = display.takeWhile { it in symbols }.mapNotNull {
            modes.getOrNull(symbols.indexOf(it))
        }.toSet()
        val best = present.map { modes.indexOf(it) }.minOrNull()
        val symbol = best?.let { symbols.getOrNull(it) }
        return symbol?.let { symbols.indexOf(it) } ?: symbols.length
    }

    @Test fun matchesLegacyComparatorForDifferentServerRules() {
        val random = Random(42)
        for ((modes, symbols) in listOf("qaohv" to "~&@%+", "ov" to "@+", "vo" to "+@")) {
            for (mapping in listOf("ascii", "rfc1459", "strict-rfc1459")) {
                val input = List(2500) {
                    val prefix = listOf("", symbols.take(1), symbols.takeLast(1), symbols)[random.nextInt(4)]
                    prefix + listOf("Nick", "nick", "[x]", "{x}", "^x", "~x")[random.nextInt(6)] + random.nextInt(100)
                }
                val rankKey: (String) -> Int = { rank(it, modes, symbols) }
                val foldKey: (String) -> String = { ircCasefold(it.trimStart(*symbols.toCharArray()), mapping) }
                val legacy = input.distinct().sortedWith(Comparator { a, b ->
                    val comparison = rankKey(a) - rankKey(b)
                    if (comparison != 0) comparison else foldKey(a).compareTo(foldKey(b))
                })
                assertEquals(legacy, orderNickDisplays(input, rankKey, foldKey))
            }
        }
    }

    @Test fun computesKeysOnceAndPreservesTies() {
        var ranks = 0
        var folds = 0
        val result = orderNickDisplays(listOf("Nick", "nick", "Nick"),
            { ranks++; 0 }, { folds++; it.lowercase() })
        assertEquals(listOf("Nick", "nick"), result)
        assertEquals(2, ranks)
        assertEquals(2, folds)
    }

    @Test fun membershipAndModeChangesDoNotUseStaleKeys() {
        fun sorted(input: List<String>, symbols: String = "@+") = orderNickDisplays(
            input, { rank(it, if (symbols == "@+") "ov" else "vo", symbols) },
            { ircCasefold(it.trimStart(*symbols.toCharArray()), "rfc1459") })
        assertEquals(listOf("Alice", "Bob"), sorted(listOf("Bob", "Alice")))
        assertEquals(listOf("@Bob", "Alice"), sorted(listOf("@Bob", "Alice")))
        assertEquals(listOf("@BOB", "Alice"), sorted(listOf("@BOB", "Alice")))
        assertEquals(listOf("Alice"), sorted(listOf("Alice")))
        assertEquals(emptyList<String>(), sorted(emptyList()))
        assertEquals(listOf("+Alice", "@Bob"), sorted(listOf("@Bob", "+Alice"), "+@"))
    }
}
