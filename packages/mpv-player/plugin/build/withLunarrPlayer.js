"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
/** NDK version required by libmpv 1.0.0 (dev.jdtech.mpv). */
const MPV_NDK_VERSION = "29.0.14206865";
const MPVKIT_POD_NAME = "MPVKit";
const MPVKIT_PODSPEC_URL = (_a = process.env.LUNARR_MPVKIT_PODSPEC_URL) !== null && _a !== void 0 ? _a : "https://raw.githubusercontent.com/mpv-ios/MPVKit/0.41.0-av/MPVKit.podspec";
/**
 * Config plugin for the @lunarr/mpv-player mpv module.
 *
 * - iOS: adds the MPVKit CocoaPod to the Podfile so the native module can
 *   link libmpv, and (optionally) enables the `audio` background mode which
 *   Picture-in-Picture requires.
 * - Android: libmpv is pulled from Maven Central via the module's
 *   build.gradle. The NDK version is pinned here too: the default Expo NDK
 *   (27, clang 18) bundles a libc++_shared.so too old to satisfy libmpv.so's
 *   undefined __from_chars_floating_point symbol, crashing on load with
 *   UnsatisfiedLinkError. NDK 29 (clang 21) provides the matching libc++.
 */
const withLunarrPlayer = (config, options) => {
    var _a, _b, _c;
    const podName = (_a = options === null || options === void 0 ? void 0 : options.podName) !== null && _a !== void 0 ? _a : MPVKIT_POD_NAME;
    const podspecUrl = (_b = options === null || options === void 0 ? void 0 : options.podspecUrl) !== null && _b !== void 0 ? _b : MPVKIT_PODSPEC_URL;
    const enablePictureInPicture = (_c = options === null || options === void 0 ? void 0 : options.enablePictureInPicture) !== null && _c !== void 0 ? _c : true;
    let nextConfig = config;
    nextConfig = (0, config_plugins_1.withGradleProperties)(nextConfig, (config) => {
        const props = config.modResults;
        const keyIdx = props.findIndex((item) => item.type === "property" && item.key === "ndkVersion");
        const property = { type: "property", key: "ndkVersion", value: MPV_NDK_VERSION };
        if (keyIdx >= 0) {
            props.splice(keyIdx, 1, property);
        }
        else {
            props.push(property);
        }
        return config;
    });
    nextConfig = (0, config_plugins_1.withPodfile)(nextConfig, (config) => {
        const podfile = config.modResults.contents;
        const podLine = `  pod '${podName}', :podspec => '${podspecUrl}'`;
        if (!podfile.includes(podLine)) {
            config.modResults.contents = podfile.replace("use_expo_modules!", `use_expo_modules!\n${podLine}`);
        }
        return config;
    });
    if (enablePictureInPicture) {
        nextConfig = (0, config_plugins_1.withInfoPlist)(nextConfig, (config) => {
            var _a;
            const modes = (_a = config.modResults.UIBackgroundModes) !== null && _a !== void 0 ? _a : [];
            if (!modes.includes("audio")) {
                config.modResults.UIBackgroundModes = [...modes, "audio"];
            }
            return config;
        });
    }
    return nextConfig;
};
exports.default = withLunarrPlayer;
