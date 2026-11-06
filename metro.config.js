const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql");

// Alias web-only deps pulled in by react-aria/react-stately (via @gluestack-ui/themed)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-dom": path.resolve(__dirname, "shims/react-dom.js"),
};

module.exports = config;
