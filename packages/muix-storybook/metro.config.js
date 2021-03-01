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
      '@muix/muix-components': path.resolve(__dirname, "../muix-components"),
    },
  },
  watchFolders: [
    path.resolve(__dirname, "../muix-components"),
  ],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
