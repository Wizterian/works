const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const threadLoader = require('thread-loader');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');

const jsWorkerOptions = {
  workers: require('os').cpus().length - 1,
  workerParallelJobs: 50,
  poolTimeout: 2000,
  poolParallelJobs: 50,
  name: 'js-pool'
};
threadLoader.warmup(jsWorkerOptions, [
  'eslint-loader',
  'babel-loader'
]);

const MODE = 'production';

const entries = {};
glob.sync('./src/**/entry.js', {
  ignore: './src/**/_*.js'
}).map((file) => {
  console.log(file);
  const regEx = new RegExp('./src');
  const fileOriginalName = file.replace(regEx, '');
  const key = fileOriginalName.replace('entry.js', 'bundle.js');
  entries[key] = file;
});

const entriesSass = {};
glob.sync('./src/**/*.scss', {
  ignore: './src/**/_*.scss'
}).map((file) => {
  console.log(file);
  const regEx = new RegExp('./src');
  const fileOriginalName = file.replace(regEx, '');
  const fileChangeDirName = fileOriginalName.replace('/sass/', '/css/');
  const fileChangeExtName = fileChangeDirName.replace('.scss', '.css');
  entriesSass[fileChangeExtName] = file;
});

module.exports = [
  {
    mode: MODE,
    entry: entriesSass,
    output: {
      path: path.join(`${__dirname}/htdocs`),
      filename: '../webpack/hash/[contenthash]'
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('cssnano')({
                    preset: 'default',
                  }),
                  require('autoprefixer')({
                    grid: true
                  }),
                  require('postcss-assets')({
                    loadPaths: ['htdocs']
                  })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name]'
      }),
      new WebpackBuildNotifierPlugin({
        title: 'Sass Builded!',
        suppressSuccess: true
      })
    ]
  },

  {
    mode: MODE,
    entry: entries,
    output: {
      path: path.join(`${__dirname}/htdocs`),
      filename: '[name]'
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/event/2021/'),
      },
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            { loader: 'thread-loader', options: jsWorkerOptions },
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                ]
              }
            },
            {
              loader: 'eslint-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new MergeIntoSingleFilePlugin({
        files: {
          'event/2021/assets/common/js/libs.js': [
            'src/event/2021/assets/common/js/libs/**/*.js'
          ]
        },
        transform: {
          'assets/common/js/libs.js': code => require('uglify-js').minify(code).code
        }
      }),
      new WebpackBuildNotifierPlugin({
        title: 'JavaScript Builded!',
        suppressSuccess: true
      })
    ]
  }
];
