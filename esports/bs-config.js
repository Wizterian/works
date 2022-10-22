const ssi = require('./node_modules/browsersync-ssi');
module.exports = {
  port: 3006,
  files: [
    './htdocs/**/*.css',
    './htdocs/**/*.html',
    './htdocs/**/*.js'
  ],
  server: {
    baseDir: './htdocs/'
  },
  middleware: ssi({
    baseDir: './htdocs/',
    ext: '.html'
  }),
  ghostMode: false,
  browser: "google chrome",
  open: 'local'
}
