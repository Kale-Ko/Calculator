const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/index.ts"),
  target: "web",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "out/")
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: "ts-loader"
      }
    ]
  }
}