const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../../packages")];
config.resolver.alias = {
  "@lunarr/api": path.resolve(__dirname, "../../packages/api/src/index.ts"),
};

module.exports = config;
