# Lunarr Mobile v1.0.0

Companion app for a self-hosted [Lunarr](../lunarr-sveltekit) server. iOS and Android.

## Included in v1

- **Connect:** device pairing (recommended) or manual server URL + personal API key
- **Movies & shows:** hub tabs with search, filters, sort, and horizontal rails
- **Browse lists:** all, recent, latest, popular, discover, and similar titles
- **Continue watching:** in-progress movies and TV episodes with resume progress
- **Details:** movie/show/episode/season pages, cast, people, trailers (external link)
- **Playback:** direct play and server transcode (HLS), progress sync, subtitle overlay, picture-in-picture on background
- **Watch state:** mark movies, episodes, and seasons watched or unwatched
- **Settings:** playback preferences (direct vs transcode, audio/subtitle language), disconnect
- **Resilience:** pull-to-refresh, infinite scroll, loading skeletons, error retry states
- **Session handling:** automatic sign-out when the API key is revoked (401)

## Not included in v1

These are intentionally out of scope for the first release:

- Guest **share links** (`/api/share/...`)
- **Admin** features (libraries, users, jobs, server settings)
- **Metadata refresh** from the app
- **Background audio**, or dedicated AirPlay/Cast UI
- **Deep links** into specific titles
- **Offline** viewing or downloads
- **Push notifications**
- Automated test suite / CI (manual QA recommended before install)

## Requirements

- A running Lunarr server with at least one personal API key (or approval via device pairing)
- iOS 16.4+ or Android API 24+
- Network access to your server (HTTPS recommended; HTTP allowed for LAN/self-hosted use)

## Distribution notes

- Development builds use `expo-dev-client` and Metro for local work
- Preview/production EAS builds are suitable for TestFlight, internal APK, or sideload
- App Store / Play Store submission may require a privacy policy explaining that the app connects only to user-provided servers and stores credentials on-device
