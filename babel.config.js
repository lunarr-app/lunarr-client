module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@backend": "./backend",
            "@components": "./components",
            "@helpers": "./helpers",
            "@hooks": "./hooks",
            "@store": "./store",
          },
        },
      ],
      "react-native-paper/babel",
      "@babel/plugin-proposal-export-namespace-from",
      "react-native-reanimated/plugin",
      require.resolve("expo-router/babel"),
    ],
  };
};
