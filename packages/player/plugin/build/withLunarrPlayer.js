"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const MPVKIT_POD_NAME = "MPVKit";
const MPVKIT_PODSPEC_URL =
  process.env.LUNARR_MPVKIT_PODSPEC_URL ??
  "https://raw.githubusercontent.com/mpv-ios/MPVKit/0.41.0-av/MPVKit.podspec";

const withLunarrPlayer = (config, options) => {
  const podName = options?.podName ?? MPVKIT_POD_NAME;
  const podspecUrl = options?.podspecUrl ?? MPVKIT_PODSPEC_URL;
  const enablePictureInPicture = options?.enablePictureInPicture ?? true;

  let nextConfig = config;

  nextConfig = (0, config_plugins_1.withPodfile)(nextConfig, (config) => {
    const podfile = config.modResults.contents;
    const podLine = `  pod '${podName}', :podspec => '${podspecUrl}'`;
    if (!podfile.includes(podLine)) {
      config.modResults.contents = podfile.replace(
        "use_expo_modules!",
        `use_expo_modules!\n${podLine}`,
      );
    }
    return config;
  });

  if (enablePictureInPicture) {
    nextConfig = (0, config_plugins_1.withInfoPlist)(nextConfig, (config) => {
      const modes = config.modResults.UIBackgroundModes ?? [];
      if (!modes.includes("audio")) {
        config.modResults.UIBackgroundModes = [...modes, "audio"];
      }
      return config;
    });
  }

  return nextConfig;
};

exports.default = withLunarrPlayer;