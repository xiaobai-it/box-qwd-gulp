const { src, dest, parallel, series, watch } = require('gulp')
// 安装了这个插件，gulp-开头的插件就不需要引入了，该插件会自动引用的
// gulp-load-plugins引入后返回的是一个函数，需要调用这个函数才可以
const gulpLoadPlugins = require('gulp-load-plugins')()
const del = require('del')
const browserSync = require('browser-sync')
const browser = browserSync.create() // 创建一个热更新的服务器

const cwd = process.cwd() // 获取到当前代码的工作目录，也就是编辑器内的命令行显示的目录
let config = {
  // 默认配置
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    distPublic: 'dist/public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**',
      public: 'public/**'
    },
  }
}
try {
  const config1 = require(`${cwd}/box.qwd.gulp.config.js`)
  config = Object.assign({}, config, config1)
} catch (error) {

}


const styles = () => {
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
    .pipe(gulpLoadPlugins.sass({ outputStyle: "expanded" }))
    .pipe(dest(config.build.temp))
    .pipe(browser.reload({ stream: true }))
}

const scripts = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(gulpLoadPlugins.babel({ presets: [require('@babel/preset-env')] }))
    // .pipe(gulpLoadPlugins.babel({ presets: ['@babel/env'] }))
    .pipe(dest(config.build.temp))
    .pipe(browser.reload({ stream: true }))
}

const pages = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
    // .pipe(gulpLoadPlugins.swig({ data: config.data }))
    .pipe(gulpLoadPlugins.swig())
    .pipe(dest(config.build.temp))
    .pipe(browser.reload({ stream: true }))
}

const images = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(gulpLoadPlugins.imagemin())
    .pipe(dest(config.build.dist))
}

const fonts = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(gulpLoadPlugins.imagemin())
    .pipe(dest(config.build.dist))
}

const othersFile = () => {
  return src(config.build.paths.public, { base: config.build.public, cwd: config.build.public })
    .pipe(dest(config.build.distPublic))
  // return src('public/**', { base: 'public' })
  //   .pipe(dest('dist/public'))
}

const clean = () => {
  // del 返回的promise对象，可以作为gulp任务结束的标记
  return del([config.build.dist, config.build.temp])
}
const serve = () => {
  // 监视开发中文件的变换，从而执行对应的gulp任务
  watch(config.build.paths.styles, { cwd: config.build.src }, styles)
  watch(config.build.paths.scripts, { cwd: config.build.src }, scripts)
  watch(config.build.paths.pages, { cwd: config.build.src }, pages)
  watch(config.build.paths.images, { cwd: config.build.src }, browser.reload)
  watch(config.build.paths.fonts, { cwd: config.build.src }, browser.reload)
  watch(config.build.paths.public, { cwd: config.build.public }, browser.reload)
  browser.init({
    port: 4000,
    notify: false,
    // 一旦dist文件下的内容改变，浏览器就会自动刷新，显示最新数据，热更新，
    // 可以用browser-sync提供的reload()方法来实现
    // files: 'dist/**',
    server: { // 将内置的静态服务器用于基本的HTML / JS / CSS网站
      baseDir: [config.build.temp, config.build.src, config.build.public], // // 从来往后依次查找，找到就直接用
      // 开发阶段，解决dist目录下，文件内引用的样式、js不起作用的问题
      // 线上阶段用useref可以处理html文件中的构建注释，也可以实现压缩
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  // 找到dist目录下的所有的html文件，判断文件内的构建注释里的链接是哪种类型，从而进行处理
  // 因为从dist取文件，编制后在放入dist目录，会起冲突，所以需要一个临时目录temp来存储对应的文件
  // temp目录是临时目录，打包之后还是要放入dist目录内才行
  // 所以需要对所有任务内的入口和出口进行调整
  // gulpLoadPlugins.useref({ searchPath: [config.build.temp, '.'] }) 查找的是html文件内的构建注释引用的位置
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    .pipe(gulpLoadPlugins.useref({ searchPath: [config.build.temp, '.'] }))
    //gulp-if=>判断文件流中是哪种文件，然后就进行相应的压缩,都是从html中构建注释获取的文件类型
    .pipe(gulpLoadPlugins.if(/\.js$/, gulpLoadPlugins.uglify()))
    .pipe(gulpLoadPlugins.if(/\.css$/, gulpLoadPlugins.cleanCss()))
    .pipe(gulpLoadPlugins.if(/\.html$/, gulpLoadPlugins.htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true })))
    .pipe(dest(config.build.dist))
}

const combination = parallel(styles, scripts, pages)

const dev = series(clean, combination, serve)

const build = series(clean, parallel(series(combination, useref)), images, fonts, othersFile)

module.exports = {
  clean,
  dev,
  build
}