const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/index.ts"),
  target: "web",
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "out/")
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map"
}