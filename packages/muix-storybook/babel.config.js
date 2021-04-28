const path = require("path");

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver', {
      "extensions": [".js", ".jsx", ".ts", ".tsx"],
      "alias": {
        "@muix": path.resolve(__dirname, "../muix/src"),
      }
    }],
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ],
};
