### 安装：npm install --save-dev  box-qwd-gulp
### 在项目根目下创建一个文件：box.qwd.gulp.config.js   
### 文件的配置选项如下：  
```
module.exports = {
  // html文件的数据，里面有模板
  data: {},
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

```