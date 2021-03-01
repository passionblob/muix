const path = require("path");

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  projectRoot: path.resolve(__dirname),
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
    extraNodeModules: new Proxy(
      {
        '@muix/muix-components': path.resolve(__dirname, "../muix-components"),
      },
      {
        get: (target, name) => {
          return path.join(__dirname, `node_modules/${name}`);
        }
      }
    )
  },
  watchFolders: [
    path.resolve(__dirname, "../../node_modules"),
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
