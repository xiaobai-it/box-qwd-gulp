#!/usr/bin/env node

// #!/usr/bin/env node 作为cli的入口文件
// cwd 的路径
process.argv.push('--cwd')
process.argv.push(process.cwd())
// gulpfile文件路径
process.argv.push('--gulpfile')
process.argv.push(require.resolve('../lib/index.js'))
// process.argv.push(require.resolve('..'))
// process.argv.push('../lib/index.js')
require('gulp/bin/gulp') // 执行node_modules下的gulp/bin/gulp.js文件
