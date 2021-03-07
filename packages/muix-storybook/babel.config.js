const path = require("path");

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver', {
      "extensions": [".js", ".jsx", ".ts", ".tsx"],
      "alias": {
        "@muix/muix-components": path.resolve(__dirname, "../muix-components"),
      }
    }],
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ],
};
