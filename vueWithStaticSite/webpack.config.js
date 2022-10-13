const path = require('path'); // _dirnameのbug回避用。install不要
const glob = require('glob'); // entryファイル複数指定
const {VueLoaderPlugin} = require("vue-loader"); // vue用
const webpack = require('webpack'); // vue用。warning回避

/** 
 * entryファイル複数指定
 * 「npm i glob」でインストール
 * sync 収集ファイル指定
 * sync ignore オプションで無視ファイル指定
 * sync cwd 指定ディレクトリ以下検索
 *     複数指定の場合、pathに「./src」記述が必要なため不使用
*/
console.log('*********************************');
console.log('Compiled js file list (webpack process)');
console.log('*********************************');
const entries = {};
glob
  .sync('./src/**/entry.js', {
    ignore: './src/**/_*.js'
  })
  .map((file) => {
    const regEx = new RegExp('./src');
    const fileOriginalName = file.replace(regEx, '');
    const key = fileOriginalName.replace('entry.js', 'bundle.js');
    entries[key] = file;
  });

// const MODE = "development";
const MODE = "production";

module.exports = [
  {
    /** 
     * jsコンパイル設定
     * productionは最適化された状態、
     * developmentはソースマップ有効でJSファイル出力
    */
    mode: MODE,

    /** 
     * 基本ファイル入出力設定
     * entry … srcのエントリーファイル指定
     *     配列なら結合、オブジェクトなら複数のエントリーファイル生成
     *     https://qiita.com/masarufuruya/items/6d89f0d91ad192cb4b73
     *     https://qiita.com/sansaisoba/items/921438a19cbf5a31ec53
     * output
     *     path … 出力ディレクトリ名（ない場合、dist）
     *     file:'[name]' … entryファイルオブジェクトの
     *     keyを参照し出力（ない場合、main.js）
     * resolve
     *     extensions: ['.js']
     *         対象とするファイル拡張子
     *         指定しないとエラー
     *         Field 'browser' doesn't contain a valid alias configuration
     *     chunkFileName
     *         routerでcomponentをlazy loadingする際、
     *         routerかwebpack.configに記載
    */
    entry: entries,
    output: {
      path: path.join(`${__dirname}/htdocs`),
      filename: '[name]',
      // chunkFilename: './event/2022/views/[name].js' // vue用 routerでlazy load時ファイル名をつける @エイリアスとconflict?
    },
    resolve: {
      extensions: ['.js', 'vue'], // vue用
      alias: {'@': path.resolve(__dirname, 'src/event/2022')} // vue用（optional）
    },

    /** 
     * browser-syncに変更のため未使用
     * webpackサーバー設定
     * static:{directory:'xxxx'} … サーバーの起点ディレクトリ
     * open:true … 起動時ブラウザが開く
     */
    // devServer: {
    //   static: {
    //     directory: path.join(`${__dirname}/htdocs`)
    //   },
    //   open: true
    // },

    //ローダーの設定
    module: {
      rules: [
        {
          test: /\.pug$/, // vue用。<template lang="pug">の場合
          loader: 'vue-pug-loader'
        },
        {
          test: /.css$/, // vue用。<style>の場合
          use: [ // vue-style-loader、css-loaderを使う
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.scss$/, // vue用。<style lang="scss">の場合
          use: [ // vue-style-loader、css-loaderを使う
            'vue-style-loader',
            'css-loader',
            'sass-loader' // scssを使いたい場合
          ]
        },
        {
          test:/\.vue$/, // // vue用。拡張子が.vueの場合
          loader: 'vue-loader' // vue-loaderを使う
        },
        {
          test: /\.js$/, // vue用。babelがないとエラー。設定必須
          exclude: /node_modules/, // ローダーの処理から外すフォルダ
          loader: 'babel-loader', // babel-loaderを使う
          options: {
            // プリセットを指定することで、ES2019をES6に変換
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      ]
    },
    plugins: [
        new VueLoaderPlugin(), // vue用
        new webpack.DefinePlugin({
          __VUE_OPTIONS_API__: false, // vue用。warningが出るため記載
          __VUE_PROD_DEVTOOLS__: false, // vue用。warningが出るため記載
        })
    ],

    /** 
     * size limit warning in webpack
     * 読み込みに影響するのでコードを分けて対応する
     * falseは一時的な使用に抑える
     * WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
     * https://webpack.js.org/guides/code-splitting/
    */
    performance: { hints: false }
  },
];