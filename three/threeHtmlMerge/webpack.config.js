const path = require("path");

module.exports = {
  // メインとなるJavaScriptファイル（エントリーポイント）
  context: path.join(__dirname, "src/js"),
  entry: `./index.js`,
  mode: "development",
  // ファイルの出力設定
  output: {
    //  出力ファイルのディレクトリ名
    path: path.join(__dirname, "dist/js"),
    // 出力ファイル名
    filename: "./main.js",
    publicPath: "/js/"
  },
  devServer: {
    static: "dist",
    open: true
  }
};