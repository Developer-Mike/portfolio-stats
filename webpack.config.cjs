const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/main.ts",
  target: "node",
  externals: {
    "skia-canvas": "commonjs skia-canvas"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  }
};