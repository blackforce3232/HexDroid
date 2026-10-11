# Geveze / HexDroid Project Handoff

## Current state

- Android IRC client project. Technical package/class names remain `com.boxlabs.hexdroid` / HexDroid for compatibility.
- Visible branding was changed toward **Geveze**.
- Default theme is light.
- Default message text scale is 85%, independent from global UI scale.
- JOIN/PART/QUIT and nick-change informational lines are hidden by default through `hideJoinPartQuit`; topic and mode information remains available.
- Logging and server-buffer logging default to enabled.
- Network tabs and the upper channel switcher default to enabled.
- The duplicate lower channel switcher was removed; the upper switcher is intended to remain directly below the centered action-icon bar.
- The top bar no longer displays the network/channel title or `Modes:` text; action icons remain.
- Landscape nicklist default width range was increased to approximately 130–340 dp.

## Important files

- [`IrcViewModel.kt`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt): `UiSettings`, defaults, event rendering, network behavior.
- [`SettingsRepository.kt`](app/src/main/java/com/boxlabs/hexdroid/data/SettingsRepository.kt): settings JSON defaults and persistence.
- [`ChatScreen.kt`](app/src/main/java/com/boxlabs/hexdroid/ui/ChatScreen.kt): chat layout, top action bar, channel switcher, nicklist.
- [`SettingsScreen.kt`](app/src/main/java/com/boxlabs/hexdroid/ui/SettingsScreen.kt): settings UI.
- [`sync_app_icon.bat`](sync_app_icon.bat): copies [`hexdroid_logo.png`](app/src/main/res/drawable/hexdroid_logo.png) to launcher icon variants.

## Launcher icon workflow

1. Replace [`hexdroid_logo.png`](app/src/main/res/drawable/hexdroid_logo.png).
2. Double-click [`sync_app_icon.bat`](sync_app_icon.bat) from the project root.
3. Commit the generated PNG icon changes.

The project previously had PNG/WEBP duplicate launcher resources. The old WEBP launcher files were removed; do not reintroduce same-name PNG and WEBP resources in the same density directory.

## Build / verification

Run in GitHub Codespaces or GitHub Actions:

```bash
chmod +x gradlew
./gradlew assembleRelease -PrequireSigning=true
```

Known fixes already made:

- Adaptive icon XML files use valid quoted XML attributes.
- Plaintext connection warning was intentionally disabled.
- A nullable `NetworkProfile` compile issue was avoided after disabling that warning branch.

## Caution for next session

- Always verify file creation/modification with a listing or read after a write operation.
- Avoid broad automated string replacements across technical class names; visible branding and protocol/package identifiers are intentionally separate.
- After changing [`ChatScreen.kt`](app/src/main/java/com/boxlabs/hexdroid/ui/ChatScreen.kt) or [`IrcViewModel.kt`](app/src/main/java/com/boxlabs/hexdroid/IrcViewModel.kt), run the Codespace release build before further UI changes.
