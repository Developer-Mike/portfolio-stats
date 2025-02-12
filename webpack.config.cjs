const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/main.ts",
  target: "node",
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "main.js",
    library: {
      type: "module"
    },
    module: true,
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