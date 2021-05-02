module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    "@babel/preset-react",
    "module:metro-react-native-babel-preset",
  ],
  plugins: [
    ["module-resolver", {
      root: ["./"],
      alias: {
        "^react-native$": "react-native-web",
        "@monthem/muix/src": "@monthem/muix",
      }
    }],
    ["@babel/plugin-proposal-private-methods", { "loose": true }]
  ]
}