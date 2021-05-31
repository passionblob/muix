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
        "@monthem/muix/src": "./src",
        "@monthem/muix": "./src",
      }
    }],
    ["@babel/plugin-proposal-private-methods", { "loose": true }]
  ]
}