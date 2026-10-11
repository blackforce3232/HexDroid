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

        val designsFile = "window.tasarımlar = {\n1: { classes: ['bfFnt3', 'bfrenK21'] },\n203: { classes: ['bfFnt91', 'bfrenK701', 'bfEfekt-202'] }\n};"
        assertEquals(listOf("bfFnt91", "bfrenK701", "bfEfekt-202"), RemoteNickStyles.parseDesigns(designsFile)[203])

        val css = ".bfFnt132 { font-size: 15px; font-family: 'Amatic SC', cursive; } .bfrenK24 { color: #ff3366; }"
        assertEquals("Amatic SC", RemoteNickStyles.parseCssFonts(css)["bfFnt132"]?.first)
        assertEquals(0xFFFF3366.toInt(), RemoteNickStyles.parseCssColors(css)["bfrenK24"])

        val styledCss = ".bfFnt23 { font-size: 14px; font-family: 'Charmonman', cursive; font-weight: 900; font-style: italic; letter-spacing: 2px; }"
        val properties = RemoteNickStyles.parseFontProperties(styledCss, "bfFnt23")
        assertEquals("900", properties["font-weight"])
        assertEquals("italic", properties["font-style"])
        assertEquals("2px", properties["letter-spacing"])

        val gradient = ".bfGad600 { background: linear-gradient(to right, #9c27b0, #e91e63); color: transparent; }"
        assertEquals(listOf(0xFF9C27B0.toInt(), 0xFFE91E63.toInt()), RemoteNickStyles.parseCssGradients(gradient)["bfGad600"])
        val shadowCss = ".bfrenK556 { color: #00108d; text-shadow: 0px 0px 1px #00bbff; }"
        assertEquals(0xFF00BBFF.toInt(), RemoteNickStyles.parseCssShadows(shadowCss)["bfrenK556"]?.color)
    }

    @Test
    fun nickStylesHonorCaseInsensitiveMatching() {
        assertEquals(
            RemoteNickStyles.parseSpecialNicks("\"Queen\": [\"#f600fb\", \"Role\", false]")["queen"],
            RemoteNickStyles.parseSpecialNicks("\"Queen\": [\"#f600fb\", \"Role\", false]")["QUEEN"],
        )
    }
}
