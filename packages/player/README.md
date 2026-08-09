# @lunarr/player

mpv-based video player for the Lunarr client apps. A custom Expo module
(`expo-modules-core`) that wraps libmpv via MPVKit (iOS/tvOS) and
`dev.jdtech.mpv` (Android) to give mobile and TV a single, high-codec
player with direct-play support.

| Platform | Engine | Video Output |
| --- | --- | --- |
| iOS | MPVKit (libmpv, LGPL build) | `vo_avfoundation` (AVSampleBufferDisplayLayer) |
| tvOS | MPVKit (libmpv) | `vo_avfoundation` + HDR display criteria |
| Android | `dev.jdtech.mpv` (libmpv) | `gpu-next` / `mediacodec` |

## Features

- Wide codec support (HEVC, AV1, VP9, MKV, and more) via libmpv/FFmpeg.
- Direct-play: advertises all-codec native playback so the backend sends
  `mode: "direct"`.
- Picture-in-Picture on **iOS/Android mobile only** (tvOS has none).
- Contain / cover content-fit only.
- Subtitle track control, audio track control, external subtitle files.
- Playback speed, seek, technical info, Now Playing integration (iOS).

## Usage

The module is consumed by the mobile and TV apps as a native view:

```tsx
import { MpvPlayerView, type MpvPlayerViewRef } from "@lunarr/player";

<MpvPlayerView
  ref={playerRef}
  source={{ url, headers, startPosition, autoplay, ... }}
  onProgress={handleProgress}
  onPlaybackStateChange={handleState}
  onError={handleError}
  onEnd={handleEnd}
/>
```

## Attribution

The native player code in `ios/` and `android/` is adapted from
**[Streamyfin](https://github.com/streamyfin/streamyfin)** (MPL-2.0), a
Jellyfin client whose `mpv-player` Expo module this package is derived from.
We are grateful to the Streamyfin maintainers for releasing their mpv
integration under the Mozilla Public License 2.0.

Changes made on top of the upstream module for Lunarr:

- Removed the presented full-screen native player, keeping the RN-embedded
  `MpvPlayerView` as the single player surface.
- Replaced `expo-video` with this module in both the mobile and TV apps.
- Added a native `onEnd` event (iOS `MPV_END_FILE_REASON_EOF`, Android via
  the `eof-reached` property) for unambiguous end-of-file detection.
- Picture-in-Picture on mobile only, plus tvOS HDR display criteria.
- Restricted content-fit to contain/cover.
- Hardened the Android renderer (thread-safety, EOF handling).

## License

Licensed under the **Mozilla Public License 2.0** (MPL-2.0), matching the
upstream Streamyfin code it is derived from. See the repo root `LICENSE` for
the full text.