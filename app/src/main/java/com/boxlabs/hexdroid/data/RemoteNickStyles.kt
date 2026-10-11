package com.boxlabs.hexdroid.data

import android.content.Context
import android.graphics.Typeface
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color as ComposeColor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import java.net.URI
import java.util.concurrent.TimeUnit

data class SpecialNickRule(val colorArgb: Int, val bold: Boolean)

data class BfNickRule(
    val fontFamily: String?,
    val fontSizeSp: Float?,
    val colorArgb: Int?,
    val fontWeight: Int? = null,
    val italic: Boolean = false,
    val letterSpacingSp: Float? = null,
    val gradientColors: List<Int> = emptyList(),
    val shadowColor: Int? = null,
    val shadowRadiusDp: Float = 0f,
    val shadowOffsetXDp: Float = 0f,
    val shadowOffsetYDp: Float = 0f,
) {
    fun toSpanStyle(font: FontFamily?): androidx.compose.ui.text.SpanStyle = androidx.compose.ui.text.SpanStyle(
        fontFamily = font,
        fontSize = fontSizeSp?.coerceIn(9f, 24f)?.sp ?: TextUnit.Unspecified,
        fontWeight = fontWeight?.let { FontWeight(it.coerceIn(100, 900)) },
            fontStyle = if (italic) FontStyle.Italic else FontStyle.Normal,
            letterSpacing = letterSpacingSp?.coerceIn(0f, 4f)?.sp ?: TextUnit.Unspecified,
            brush = gradientColors.takeIf { it.size >= 2 }?.let { androidx.compose.ui.graphics.Brush.linearGradient(it.map(androidx.compose.ui.graphics.Color::invoke)) },
            shadow = shadowColor?.let { androidx.compose.ui.graphics.Shadow(androidx.compose.ui.graphics.Color(it), androidx.compose.ui.geometry.Offset(shadowOffsetXDp, shadowOffsetYDp), shadowRadiusDp) },
        )
}

data class RemoteNickStylesSnapshot(
    val special: Map<String, SpecialNickRule> = emptyMap(),
    val bf: Map<String, BfNickRule> = emptyMap(),
    val fetchedAtMs: Long = 0L,
) {
    fun specialRule(nick: String): SpecialNickRule? = special[ircFoldNick(nick)]
    fun bfRule(nick: String): BfNickRule? = bf[ircFoldNick(nick)]
}

internal fun ircFoldNick(value: String): String = value.trim().trimStart('~', '&', '@', '%', '+')
    .lowercase(java.util.Locale.ROOT)
    .replace('[', '{').replace(']', '}').replace('\\', '|').replace('^', '~')

/** Fetches narrowly allowlisted legacy configuration files as data; never evaluates JavaScript. */
class RemoteNickStyles(private val context: Context) {
    private val prefs = context.getSharedPreferences("remote_nick_styles", Context.MODE_PRIVATE)
    private val mutex = Mutex()
    private val client = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(12, TimeUnit.SECONDS)
        .callTimeout(15, TimeUnit.SECONDS)
        .followRedirects(false)
        .build()

    @Volatile private var current: RemoteNickStylesSnapshot = loadCached()
    fun snapshot(): RemoteNickStylesSnapshot = current

    suspend fun refresh(): RemoteNickStylesSnapshot = mutex.withLock {
        val urls = listOf(
            "https://irc.geveze.org:27545/js/ayarlar.js",
            "https://irc.geveze.org:27555/js/ayarlar.js",
            "https://irc.geveze.org:27547/js/ayarlar.js",
            "https://irc.geveze.org:27546/js/ayarlar.js",
            "https://irc.geveze.org/bf/nickdb.js",
            "https://irc.geveze.org/bf/bf_yeni.js",
        )
        withContext(Dispatchers.IO) {
            val settings = urls.take(4).firstNotNullOfOrNull { runCatching { fetch(it) }.getOrNull() }
                ?: throw java.io.IOException("Uzak ayarlar.js dosyası alınamadı")
            // Optional BF assets may be unavailable independently of the special nick list.
            val bfNickDb = runCatching { fetch(urls[4]) }.getOrDefault("")
            val bfCss = runCatching { fetch(urls[5]) }.getOrDefault("")
            val special = parseSpecialNicks(settings)
            val bfNames = parseNickStyles(bfNickDb)
            val bfStyleIds = parseDesigns(bfCss)
            val colors = parseCssColors(bfCss)
            val fonts = parseCssFonts(bfCss)
            val gradients = parseCssGradients(bfCss)
            val shadows = parseCssShadows(bfCss)
            val bf = bfNames.mapNotNull { (nick, id) ->
                val classes = bfStyleIds[id] ?: return@mapNotNull null
                val fontClass = classes.firstOrNull { it.startsWith("bfFnt") }
                val colorClass = classes.firstOrNull { it.startsWith("bfrenK") }
                val gradientClass = classes.firstOrNull { it.startsWith("bfGad") }
                val font = fontClass?.let(fonts::get)
                val cssProps = fontClass?.let { parseFontProperties(bfCss, it) }.orEmpty()
                val gradient = gradientClass?.let(gradients::get).orEmpty()
                val shadow = colorClass?.let(shadows::get)
                nick to BfNickRule(
                    font?.first,
                    font?.second,
                    colorClass?.let(colors::get),
                    cssProps["font-weight"]?.toIntOrNull(),
                    cssProps["font-style"] == "italic",
                    cssProps["letter-spacing"]?.removeSuffix("px")?.toFloatOrNull(),
                    gradient,
                    shadow?.color,
                    shadow?.radius ?: 0f,
                    shadow?.dx ?: 0f,
                    shadow?.dy ?: 0f,
                )
            }.toMap()
            if (special.isEmpty()) throw IllegalArgumentException("Uzak özel nick yapılandırması boş veya tanınmayan biçimde")
            val next = RemoteNickStylesSnapshot(special, bf, System.currentTimeMillis())
            current = next
            prefs.edit().putString("snapshot", encode(next)).apply()
            next
        }
    }

    private fun fetch(url: String): String {
        val uri = URI(url)
        require(uri.scheme == "https" && uri.host == "irc.geveze.org" && uri.userInfo == null)
        require(uri.port == -1 || uri.port in setOf(27545, 27546, 27547, 27555))
        val request = Request.Builder().url(url).header("Accept", "text/javascript, application/javascript, text/plain").build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw java.io.IOException("HTTP ${response.code} $url")
            val body = response.body ?: throw java.io.IOException("Boş cevap: $url")
            if (body.contentLength() > MAX_CONFIG_BYTES) throw java.io.IOException("Yapılandırma dosyası fazla büyük")
            val bytes = body.bytes()
            if (bytes.size > MAX_CONFIG_BYTES) throw java.io.IOException("Yapılandırma dosyası fazla büyük")
            return bytes.toString(Charsets.UTF_8)
        }
    }

    private fun loadCached(): RemoteNickStylesSnapshot = runCatching {
        val raw = prefs.getString("snapshot", null) ?: return RemoteNickStylesSnapshot()
        decode(raw)
    }.getOrDefault(RemoteNickStylesSnapshot())

    suspend fun refreshIfStale(): RemoteNickStylesSnapshot {
        if (System.currentTimeMillis() - current.fetchedAtMs < REFRESH_INTERVAL_MS) return current
        return refresh()
    }

    private fun encode(s: RemoteNickStylesSnapshot): String {
        val root = JSONObject().put("fetchedAt", s.fetchedAtMs)
        val special = JSONObject()
        s.special.forEach { (nick, r) -> special.put(nick, JSONObject().put("color", r.colorArgb).put("bold", r.bold)) }
        val bf = JSONObject()
        s.bf.forEach { (nick, r) ->
            bf.put(nick, JSONObject().put("font", r.fontFamily).put("size", r.fontSizeSp)
            .put("color", r.colorArgb).put("weight", r.fontWeight).put("italic", r.italic)
            .put("spacing", r.letterSpacingSp).put("gradient", org.json.JSONArray(r.gradientColors))
            .put("shadowColor", r.shadowColor).put("shadowRadius", r.shadowRadiusDp)
            .put("shadowDx", r.shadowOffsetXDp).put("shadowDy", r.shadowOffsetYDp))
        }
        return root.put("special", special).put("bf", bf).toString()
    }

    private fun decode(raw: String): RemoteNickStylesSnapshot {
        val root = JSONObject(raw)
        val special = root.optJSONObject("special") ?: JSONObject()
        val bf = root.optJSONObject("bf") ?: JSONObject()
        return RemoteNickStylesSnapshot(
            special.keys().asSequence().asIterable().associate { nick ->
                val v = special.getJSONObject(nick); ircFoldNick(nick) to SpecialNickRule(v.getInt("color"), v.optBoolean("bold"))
            },
            bf.keys().asSequence().asIterable().associate { nick ->
                val v = bf.getJSONObject(nick); ircFoldNick(nick) to BfNickRule(
                    v.optString("font").takeIf(String::isNotBlank),
                    v.optDouble("size", Double.NaN).toFloat().takeIf(Float::isFinite),
                    v.optInt("color").takeIf { v.has("color") },
                    v.optInt("weight").takeIf { v.has("weight") },
                    v.optBoolean("italic"),
                    v.optDouble("spacing", Double.NaN).toFloat().takeIf(Float::isFinite),
                    v.optJSONArray("gradient")?.let { a -> (0 until a.length()).map { a.getInt(it) } }.orEmpty(),
                    v.optInt("shadowColor").takeIf { v.has("shadowColor") },
                    v.optDouble("shadowRadius", 0.0).toFloat().coerceIn(0f, 8f),
                    v.optDouble("shadowDx", 0.0).toFloat().coerceIn(-8f, 8f),
                    v.optDouble("shadowDy", 0.0).toFloat().coerceIn(-8f, 8f),
                )
            },
            root.optLong("fetchedAt"),
        )
    }

    companion object {
        private const val MAX_CONFIG_BYTES = 512 * 1024
        const val REFRESH_INTERVAL_MS = 15 * 60 * 1000L
        private val nickEntry = Regex("\\\"([^\\\"]{1,64})\\\"\\s*:\\s*\\[\\s*\\\"(#?[0-9a-fA-F]{6})\\\"\\s*,\\s*\\\"[^\\\"]*\\\"\\s*,\\s*(true|false)")
        private val nickStyleEntry = Regex("\\\"([^\\\"]{1,64})\\\"\\s*:\\s*(\\d+)")
        private val designEntry = Regex("(?m)^\\s*(\\d+)\\s*:\\s*\\{\\s*classes\\s*:\\s*\\[([^]]*)]")
        private val classEntry = Regex("['\\\"]([A-Za-z0-9_-]+)['\\\"]")
        // The closing brace is literal in the JVM regex grammar and must be escaped.
        private val colorEntry = Regex("\\.(bfrenK[A-Za-z0-9_-]+)\\s*\\{([^}]+)\\}")
        private val fontEntry = Regex("\\.(bfFnt\\d+)\\s*\\{([^}]+)\\}")

        fun parseSpecialNicks(js: String): Map<String, SpecialNickRule> = nickEntry.findAll(js).associate { m ->
            val raw = m.groupValues[2].removePrefix("#").toLong(16)
            ircFoldNick(m.groupValues[1]) to SpecialNickRule((0xFF000000L or raw).toInt(), m.groupValues[3] == "true")
        }

        fun parseNickStyles(js: String): Map<String, Int> {
            val body = Regex("(?s)var\\s+nickStyles\\s*=\\s*\\{(.*?)\\}").find(js)?.groupValues?.get(1) ?: return emptyMap()
            return nickStyleEntry.findAll(body).associate { ircFoldNick(it.groupValues[1]) to it.groupValues[2].toInt() }
        }

        fun parseDesigns(js: String): Map<Int, List<String>> {
            // Find the actual `window.tasarımlar = { ... }` object, ignoring commented-out
            // examples elsewhere in the file. Each outer numeric entry's classes array is
            // extracted with balanced braces because the legacy file has the whole object on
            // one line and design declarations contain arbitrary whitespace/comments.
            val marker = js.indexOf("window.tasarımlar")
            if (marker < 0) return emptyMap()
            val start = js.indexOf('{', marker)
            if (start < 0) return emptyMap()
            val out = linkedMapOf<Int, List<String>>()
            val entryStart = Regex("(\\d+)\\s*:\\s*\\{\\s*classes\\s*:\\s*\\[").findAll(js.substring(start + 1))
            for (m in entryStart) {
                val id = m.groupValues[1].toIntOrNull() ?: continue
                val classesStart = start + 1 + m.range.last + 1
                val classesEnd = js.indexOf(']', classesStart)
                if (classesEnd < 0) continue
                val classes = classEntry.findAll(js.substring(classesStart, classesEnd)).map { it.groupValues[1] }.toList()
                if (classes.isNotEmpty()) out[id] = classes
            }
            return out
        }

        fun parseCssColors(js: String): Map<String, Int> = colorEntry.findAll(js).mapNotNull { m ->
            val hex = Regex("(?:^|;)\\s*color:\\s*#([0-9a-fA-F]{6})").find(m.groupValues[2])?.groupValues?.get(1) ?: return@mapNotNull null
            m.groupValues[1] to (0xFF000000L or hex.toLong(16)).toInt()
        }.toMap()

        fun parseCssFonts(js: String): Map<String, Pair<String, Float>> = fontEntry.findAll(js).mapNotNull { m ->
            val block = m.groupValues[2]
            val family = Regex("font-family:\\s*['\\\"]([^'\\\"]+)['\\\"]").find(block)?.groupValues?.get(1) ?: return@mapNotNull null
            val size = Regex("font-size:\\s*([0-9.]+)px").find(block)?.groupValues?.get(1)?.toFloatOrNull() ?: return@mapNotNull null
            m.groupValues[1] to (family to size.coerceIn(9f, 24f))
        }.toMap()

        fun parseFontProperties(js: String, className: String): Map<String, String> {
            val block = fontEntry.findAll(js).firstOrNull { it.groupValues[1] == className }
                ?.groupValues?.get(2) ?: return emptyMap()
            return block.split(';').mapNotNull { declaration ->
                val colon = declaration.indexOf(':')
                if (colon <= 0) null else declaration.substring(0, colon).trim() to declaration.substring(colon + 1).trim()
            }.toMap()
        }

        data class ParsedShadow(val color: Int, val radius: Float, val dx: Float, val dy: Float)

        fun parseCssGradients(js: String): Map<String, List<Int>> = Regex("\\.(bfGad[A-Za-z0-9_-]+)\\s*\\{([^}]+)\\}")
            .findAll(js).mapNotNull { m ->
                val gradient = Regex("linear-gradient\\(([^)]*)\\)").find(m.groupValues[2])?.groupValues?.get(1)
                    ?: return@mapNotNull null
                val colors = parseCssColorsFromValue(gradient)
                if (colors.size >= 2) m.groupValues[1] to colors.take(4) else null
            }.toMap()

        fun parseCssShadows(js: String): Map<String, ParsedShadow> = Regex("\\.(bfrenK[A-Za-z0-9_-]+)\\s*\\{([^}]+)\\}")
            .findAll(js).mapNotNull { m ->
                val value = Regex("text-shadow:\\s*([^;]+)").find(m.groupValues[2])?.groupValues?.get(1) ?: return@mapNotNull null
                val match = Regex("(-?[0-9.]+)px\\s+(-?[0-9.]+)px\\s+([0-9.]+)px\\s+(#[0-9a-fA-F]{6}|rgba?\\([^)]*\\))").find(value) ?: return@mapNotNull null
                val dx = match.groupValues[1].toFloatOrNull() ?: return@mapNotNull null
                val dy = match.groupValues[2].toFloatOrNull() ?: return@mapNotNull null
                val radius = match.groupValues[3].toFloatOrNull() ?: return@mapNotNull null
                val color = parseCssColorsFromValue(match.groupValues[4]).firstOrNull() ?: return@mapNotNull null
                m.groupValues[1] to ParsedShadow(color, radius.coerceIn(0f, 8f), dx.coerceIn(-8f, 8f), dy.coerceIn(-8f, 8f))
            }.toMap()

        private fun parseCssColorsFromValue(value: String): List<Int> {
            val result = mutableListOf<Int>()
            Regex("#([0-9a-fA-F]{6})").findAll(value).forEach { result += (0xFF000000L or it.groupValues[1].toLong(16)).toInt() }
            Regex("rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})(?:\\s*,\\s*([0-9.]+))?\\s*\\)").findAll(value).forEach { m ->
                val r = m.groupValues[1].toIntOrNull()?.coerceIn(0, 255) ?: return@forEach
                val g = m.groupValues[2].toIntOrNull()?.coerceIn(0, 255) ?: return@forEach
                val b = m.groupValues[3].toIntOrNull()?.coerceIn(0, 255) ?: return@forEach
                val a = m.groupValues[4].toFloatOrNull()?.let { (it.coerceIn(0f, 1f) * 255).toInt() } ?: 255
                result += (a shl 24) or (r shl 16) or (g shl 8) or b
            }
            return result
        }
    }
}

/** Downloads Google Fonts CSS for active rules, then persistently caches validated font files. */
class NickFontCache(private val context: Context) {
    private val dir = File(context.filesDir, "nick_fonts").apply { mkdirs() }
    private val client = OkHttpClient.Builder().connectTimeout(8, TimeUnit.SECONDS).readTimeout(12, TimeUnit.SECONDS).callTimeout(15, TimeUnit.SECONDS).build()
    private val mutex = Mutex()

    suspend fun load(family: String): FontFamily? = mutex.withLock {
        withContext(Dispatchers.IO) {
            val safeFamily = family.takeIf { it.matches(Regex("[A-Za-z0-9 ]{1,60}")) } ?: return@withContext null
            val key = safeFamily.lowercase().hashCode().toUInt().toString(16)
            val fontFile = listOf("woff2", "woff", "ttf").map { File(dir, "$key.$it") }.firstOrNull { it.exists() }
            val cachedFont = fontFile
            if (cachedFont == null) {
                val cssUrl = "https://fonts.googleapis.com/css?family=${java.net.URLEncoder.encode(safeFamily, "UTF-8") }"
                val css = getAllowlisted(cssUrl, "fonts.googleapis.com", 256 * 1024) ?: return@withContext null
                // Android Typeface.Builder accepts TrueType/OpenType files, not CSS webfont
                // containers (WOFF/WOFF2). Use the Google Fonts legacy CSS endpoint with a
                // browser UA that makes it return a TTF source, then cache that TTF.
                val fontMatch = Regex("url\\((https://fonts\\.gstatic\\.com/[^)]+\\.(?:ttf|otf|woff2|woff))\\)").findAll(css).lastOrNull() ?: return@withContext null
                val fontUrl = fontMatch.groupValues[1]
                val ext = fontUrl.substringAfterLast('.').lowercase()
                val encoded = getAllowlisted(fontUrl, "fonts.gstatic.com", MAX_FONT_BYTES) ?: return@withContext null
                val bytes = encoded.toByteArray(Charsets.ISO_8859_1)
                if (bytes.size < 12) return@withContext null
                if (ext == "woff2" || ext == "woff") return@withContext null
                if (ext == "ttf" && !bytes.copyOfRange(0, 4).contentEquals(byteArrayOf(0, 1, 0, 0))) return@withContext null
                val downloaded = File(dir, "$key.$ext")
                val tmp = File(dir, "$key.tmp"); tmp.writeBytes(bytes)
                if (!tmp.renameTo(downloaded)) { tmp.delete(); return@withContext null }
                return@withContext runCatching { FontFamily(Typeface.Builder(downloaded).build()) }.getOrNull()
            }
            runCatching { FontFamily(Typeface.Builder(cachedFont!!).build()) }.getOrNull()
        }
    }

    private fun getAllowlisted(url: String, host: String, max: Int): String? = runCatching {
        val uri = URI(url); require(uri.scheme == "https" && uri.host == host && uri.userInfo == null)
        val req = Request.Builder().url(url).apply {
            if (host == "fonts.googleapis.com") header("User-Agent", "Mozilla/5.0")
        }.build()
        client.newCall(req).execute().use { r ->
            if (!r.isSuccessful || r.body.contentLength() > max) return null
            val bytes = r.body.bytes(); if (bytes.size > max) return null
            if (host == "fonts.googleapis.com") bytes.toString(Charsets.UTF_8) else String(bytes, Charsets.ISO_8859_1)
        }
    }.getOrNull()

    companion object { private const val MAX_FONT_BYTES = 2 * 1024 * 1024 }
}
