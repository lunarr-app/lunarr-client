const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../packages")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.disableHierarchicalLookup = true;
config.resolver.alias = {
  "@lunarr/api": path.resolve(__dirname, "../../packages/api/src/index.ts"),
  "@lunarr/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
  "@lunarr/mpv-player": path.resolve(__dirname, "../../packages/mpv-player/index.ts"),
};

module.exports = config;
