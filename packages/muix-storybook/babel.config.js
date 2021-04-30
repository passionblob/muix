const path = require("path");

module.exports = {
  presets: [
    'module:metro-react-native-babel-preset'
  ],
  plugins: [
    ['module-resolver', {
      "extensions": [".js", ".jsx", ".ts", ".tsx"],
      "alias": {
        "react": path.resolve(__dirname, "../../node_modules/react"),
        "@monthem/muix": path.resolve(__dirname, "../muix/dist"),
        '@monthem/utils': path.resolve(__dirname, "../utils"),
        '@monthem/web-color': path.resolve(__dirname, "../web-color"),
        '@monthem/react-native-vector-icons': path.resolve(__dirname, "../react-native-vector-icons"),
        'react-native-transitional': path.resolve(__dirname, "../react-native-transitional"),
      }
    }],
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }]
  ],
};
