const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    main: "./src/main.ts",
    graphs: "./src/graphs.ts",
  },
  target: "node",
  externals: {
    "skia-canvas": "commonjs skia-canvas"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
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