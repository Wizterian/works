const ssi = require('./node_modules/browsersync-ssi');
// const historyFallback = require('connect-history-api-fallback');

module.exports = {
  startPath: './event/2022/',
  port: 3006,
  files: [
    './htdocs/**/*.css',
    './htdocs/**/*.html',
    './htdocs/**/*.js'
  ],
  server: {
    baseDir: './htdocs/'
  },
  middleware: [
    ssi({
      baseDir: './htdocs/',
      ext: '.html'
    })
    // ,
    // historyFallback({
    //   index: '/event/2022/news/'
    // })
  ],
  ghostMode: false,
  browser: 'google chrome',
  open: 'local'
};
