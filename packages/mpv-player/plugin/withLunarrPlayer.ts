import { type ConfigPlugin, withInfoPlist, withPodfile } from "expo/config-plugins";

const MPVKIT_POD_NAME = "MPVKit";
const MPVKIT_PODSPEC_URL =
  process.env.LUNARR_MPVKIT_PODSPEC_URL ?? "https://raw.githubusercontent.com/mpv-ios/MPVKit/0.41.0-av/MPVKit.podspec";

interface LunarrPlayerOptions {
  podName?: string;
  podspecUrl?: string;
  /** Enable the iOS audio background mode (required for Picture-in-Picture). */
  enablePictureInPicture?: boolean;
}

/**
 * Config plugin for the @lunarr/mpv-player mpv module.
 *
 * - iOS: adds the MPVKit CocoaPod to the Podfile so the native module can
 *   link libmpv, and (optionally) enables the `audio` background mode which
 *   Picture-in-Picture requires.
 * - Android: libmpv is pulled from Maven Central via the module's
 *   build.gradle, so no extra setup is required here.
 */
const withLunarrPlayer: ConfigPlugin<LunarrPlayerOptions | undefined> = (config, options) => {
  const podName = options?.podName ?? MPVKIT_POD_NAME;
  const podspecUrl = options?.podspecUrl ?? MPVKIT_PODSPEC_URL;
  const enablePictureInPicture = options?.enablePictureInPicture ?? true;

  let nextConfig = config;

  nextConfig = withPodfile(nextConfig, (config) => {
    const podfile = config.modResults.contents;
    const podLine = `  pod '${podName}', :podspec => '${podspecUrl}'`;

    if (!podfile.includes(podLine)) {
      config.modResults.contents = podfile.replace("use_expo_modules!", `use_expo_modules!\n${podLine}`);
    }

    return config;
  });

  if (enablePictureInPicture) {
    nextConfig = withInfoPlist(nextConfig, (config) => {
      const modes = config.modResults.UIBackgroundModes ?? [];
      if (!modes.includes("audio")) {
        config.modResults.UIBackgroundModes = [...modes, "audio"];
      }
      return config;
    });
  }

  return nextConfig;
};

export default withLunarrPlayer;
