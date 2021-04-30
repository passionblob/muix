module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  plugins: [
    ["module-resolver", {
      root: ["./src"],
      alias: {
        "^react-native$": "react-native-web",
        "@src": "./src",
      }
    }],
  ]
}