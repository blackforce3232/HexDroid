package com.boxlabs.hexdroid

import org.junit.Test
import com.boxlabs.hexdroid.data.RemoteNickStyles

import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun legacyNickStyleSourcesParseAsData() {
        val special = RemoteNickStyles.parseSpecialNicks(
            "\"Queen\": [\"#f600fb\", \"Role\", false], \"Master\": [\"#000000\", \"Owner\", true]"
        )
        assertEquals(0xFFF600FB.toInt(), special["queen"]?.colorArgb)
        assertEquals(true, special["MASTER"]?.bold)

        val nickDb = "var nickStyles = { \"Ahseen\": 132, \"Sinsirella\": 203 };"
        assertEquals(132, RemoteNickStyles.parseNickStyles(nickDb)["ahseen"])

        val designs = "  132: { classes: ['bfFnt132', 'bfrenK24'] },"
        assertEquals(listOf("bfFnt132", "bfrenK24"), RemoteNickStyles.parseDesigns(designs)[132])

        val css = ".bfFnt132 { font-size: 15px; font-family: 'Amatic SC', cursive; } .bfrenK24 { color: #ff3366; }"
        assertEquals("Amatic SC", RemoteNickStyles.parseCssFonts(css)["bfFnt132"]?.first)
        assertEquals(0xFFFF3366.toInt(), RemoteNickStyles.parseCssColors(css)["bfrenK24"])
    }

    @Test
    fun nickStylesHonorCaseInsensitiveMatching() {
        assertEquals(
            RemoteNickStyles.parseSpecialNicks("\"Queen\": [\"#f600fb\", \"Role\", false]")["queen"],
            RemoteNickStyles.parseSpecialNicks("\"Queen\": [\"#f600fb\", \"Role\", false]")["QUEEN"],
        )
    }
}
