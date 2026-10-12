package com.boxlabs.hexdroid

/** Same stable ordering as the legacy comparator, but evaluate keys once per distinct nick.
 * No cached state survives the call: PREFIX/CASEMAPPING changes take effect immediately.
 */
internal fun orderNickDisplays(
    displays: List<String>,
    rank: (String) -> Int,
    foldedBase: (String) -> String,
): List<String> {
    data class Entry(val display: String, val rank: Int, val foldedBase: String)
    return displays.distinct()
        .map { Entry(it, rank(it), foldedBase(it)) }
        .sortedWith(compareBy<Entry> { it.rank }.thenBy { it.foldedBase })
        .map { it.display }
}
