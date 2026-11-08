module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["inline-import", { extensions: [".sql"] }],
      "@babel/plugin-transform-class-static-block",
      "react-native-reanimated/plugin", // must be last
    ],
  };
};
