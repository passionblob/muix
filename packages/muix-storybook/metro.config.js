const path = require("path");

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  resolver: {
    extraNodeModules: {
      // '@muix-components': path.resolve(__dirname, "../muix"),
    },
  },
  watchFolders: [
    path.resolve(__dirname, "./node_modules"),
    path.resolve(__dirname, "../../node_modules"),
    path.resolve(__dirname, "../muix"),
    path.resolve(__dirname, "../utils"),
    path.resolve(__dirname, "../react-native-transitional"),
    path.resolve(__dirname, "../react-native-vector-icons"),
    path.resolve(__dirname, "../web-color"),
  ],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
