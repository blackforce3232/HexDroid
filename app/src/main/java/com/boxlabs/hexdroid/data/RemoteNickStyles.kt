package com.boxlabs.hexdroid.data

import android.content.Context
import android.graphics.Typeface
import androidx.compose.ui.text.font.FontFamily
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

data class BfNickRule(val fontFamily: String?, val fontSizeSp: Float?, val colorArgb: Int?)

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
            val bf = bfNames.mapNotNull { (nick, id) ->
                val classes = bfStyleIds[id] ?: return@mapNotNull null
                val fontClass = classes.firstOrNull { it.startsWith("bfFnt") }
                val colorClass = classes.firstOrNull { it.startsWith("bfrenK") }
                val font = fontClass?.let(fonts::get)
                nick to BfNickRule(font?.first, font?.second, colorClass?.let(colors::get))
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
        s.bf.forEach { (nick, r) -> bf.put(nick, JSONObject().put("font", r.fontFamily).put("size", r.fontSizeSp).put("color", r.colorArgb)) }
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
                val v = bf.getJSONObject(nick); ircFoldNick(nick) to BfNickRule(v.optString("font").takeIf(String::isNotBlank), v.optDouble("size", Double.NaN).toFloat().takeIf(Float::isFinite), v.optInt("color").takeIf { v.has("color") })
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
        private val colorEntry = Regex("\\.(bfrenK[A-Za-z0-9_-]+)\\s*\\{([^}]*)}")
        private val fontEntry = Regex("\\.(bfFnt\\d+)\\s*\\{([^}]*)}")

        fun parseSpecialNicks(js: String): Map<String, SpecialNickRule> = nickEntry.findAll(js).associate { m ->
            val raw = m.groupValues[2].removePrefix("#").toLong(16)
            ircFoldNick(m.groupValues[1]) to SpecialNickRule((0xFF000000L or raw).toInt(), m.groupValues[3] == "true")
        }

        fun parseNickStyles(js: String): Map<String, Int> {
            val body = Regex("(?s)var\\s+nickStyles\\s*=\\s*\\{(.*?)\\}").find(js)?.groupValues?.get(1) ?: return emptyMap()
            return nickStyleEntry.findAll(body).associate { ircFoldNick(it.groupValues[1]) to it.groupValues[2].toInt() }
        }

        fun parseDesigns(js: String): Map<Int, List<String>> = designEntry.findAll(js).associate { m ->
            m.groupValues[1].toInt() to classEntry.findAll(m.groupValues[2]).map { it.groupValues[1] }.toList()
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
    }
}

/** Downloads Google Fonts CSS only for active rules, then caches validated WOFF2 files locally. */
class NickFontCache(private val context: Context) {
    private val dir = File(context.filesDir, "nick_fonts").apply { mkdirs() }
    private val client = OkHttpClient.Builder().connectTimeout(8, TimeUnit.SECONDS).readTimeout(12, TimeUnit.SECONDS).callTimeout(15, TimeUnit.SECONDS).build()
    private val mutex = Mutex()

    suspend fun load(family: String): FontFamily? = mutex.withLock {
        withContext(Dispatchers.IO) {
            val safeFamily = family.takeIf { it.matches(Regex("[A-Za-z0-9 ]{1,60}")) } ?: return@withContext null
            val key = safeFamily.lowercase().hashCode().toUInt().toString(16)
            val fontFile = File(dir, "$key.woff2")
            if (!fontFile.exists()) {
                val cssUrl = "https://fonts.googleapis.com/css2?family=${java.net.URLEncoder.encode(safeFamily, "UTF-8").replace("+", "+")}&display=swap"
                val css = getAllowlisted(cssUrl, "fonts.googleapis.com", 256 * 1024) ?: return@withContext null
                val fontUrl = Regex("url\\((https://fonts\\.gstatic\\.com/[^)]+\\.woff2)\\)").find(css)?.groupValues?.get(1) ?: return@withContext null
                val bytes = getAllowlisted(fontUrl, "fonts.gstatic.com", MAX_FONT_BYTES)?.toByteArray(Charsets.ISO_8859_1) ?: return@withContext null
                if (bytes.size < 12 || !bytes.copyOfRange(0, 4).contentEquals("wOF2".toByteArray())) return@withContext null
                val tmp = File(dir, "$key.tmp"); tmp.writeBytes(bytes); tmp.renameTo(fontFile)
            }
            val tf = runCatching { Typeface.Builder(fontFile).build() }.getOrNull() ?: return@withContext null
            FontFamily(tf)
        }
    }

    private fun getAllowlisted(url: String, host: String, max: Int): String? = runCatching {
        val uri = URI(url); require(uri.scheme == "https" && uri.host == host && uri.userInfo == null)
        val req = Request.Builder().url(url).build()
        client.newCall(req).execute().use { r ->
            if (!r.isSuccessful || r.body == null || r.body!!.contentLength() > max) return null
            val bytes = r.body!!.bytes(); if (bytes.size > max) return null
            if (host == "fonts.googleapis.com") bytes.toString(Charsets.UTF_8) else String(bytes, Charsets.ISO_8859_1)
        }
    }.getOrNull()

    companion object { private const val MAX_FONT_BYTES = 2 * 1024 * 1024 }
}
