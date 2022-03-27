import fs from 'fs'
import parser from '@babel/parser'
import traverse from "@babel/traverse"
import path from 'path'
import ejs from 'ejs'
import { transformFromAst } from "babel-core";
import { jsonLoader } from './loaders/jsonLoader.js'
import { ChangeOutPutPath } from './plugins/changeOutputPath.js'
// 从tapable里面引入同步Hook
//tapable 是一个类似于 Node.js 中的 EventEmitter的库，但更专注于自定义事件的触发和处理。
import { SyncHook } from 'tapable'

// 每个文件的id
let id = 0
let outputPath = `./dist/bundle.js`
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader]
      }
    ]
  },
  plugins:[new ChangeOutPutPath('./dist/gly.js')]
}
// 创建plugin需要的Hooks对象
//new SyncHook()通过使用tapable注册同步事件
const hooks = {
  emitFile:new SyncHook(['pluginContext'])
}
// 初始化plugin
function initPlugins(){
  const plugins = webpackConfig.plugins
  plugins.forEach(plugin=>{
    // 调用plugin的_apply方法 把hooks传过去
    // 再plugin的_apply方法里会把当前Hooks的emitFile事件注册,再使用插件时通过call调用
    plugin._apply(hooks)
  })
  const pluginContext = {
    ChangeOutPutPath(path){
      console.log('path1: ', path);
      outputPath = path
    }
  }
  // 调用call方法 触发所注册的同步事件，同时把context方法传过去，让plugin调用changeOutputPath方法
  hooks.emitFile.call(pluginContext)
}
initPlugins()
function creatAsset(filePath) {
  // 读取文件内容
  let source = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })
  // 处理loader
  // 获取webpackConfig里的所有loader配置
  const loaders = webpackConfig.module.rules
  // 创建一个loader的上下文对象,用于在实现Loader的时候调用this
  const loaderContext = {
    addDep(dep){
      console.log(dep);
    }
  }
  // 遍历所有loader
  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      if (Array.isArray(use)) {
        // loader的执行顺序是从下往上执行的
        use.reverse().forEach(fn => {
          // 如果当前loader匹配的文件规则与当前的文件匹配
          // 然后将当前文件替换为处理之后的文件
          source = fn.call(loaderContext,source)
          // loaderContext 用于实现loader是调用this 
        })
      }
    }
  })

  // 获取依赖关系(@babel/parser)
  const ast = parser.parse(source, {
    sourceType: 'module'
  })
  // console.log('ast: ', ast);
  // 从ast树里取出依赖的文件 @babel/traverse
  // 定义数组存储依赖的文件
  const deps = []
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      // console.log('node: ', node);
      deps.push(node.source.value)
    }
  })
  // 将import语法转换为require(babel-core)
  const { code } = transformFromAst(ast, null, {
    presets: ['env'] //这里需要引入babel-preset-env 否则会报错
  })

  return {
    filePath,
    code,
    deps,
    id: id++,
    mapping: {}
  }
}
// 获取依赖关系图的函数
function createGraph() {
  // 获取主文件依赖
  const mainAsset = creatAsset('./example/main.js')
  // 创建依赖关系图数组[{soure:'',deps:[]},{soure:'',deps:[]}]
  const queue = [mainAsset]
  for (const asset of queue) {
    // 取出各依赖文件的路劲
    asset.deps.forEach(relativePath => {
      // 再分析各依赖文件的依赖
      const child = creatAsset(path.resolve('./example', relativePath))
      // 生成mapping
      asset.mapping[relativePath] = child.id
      // 添加到依赖关系图数组里
      queue.push(child)
    })
  }
  return queue
}

const graph = createGraph()

// 实现打包函数
function build(graph) {
  // 引入ejs 根据设定的模板转换代码
  // 读取模板文件
  const template = fs.readFileSync('./bundle.ejs', { encoding: 'utf-8' })
  const code = ejs.render(template, { graph })
  console.log('outputPath: ', outputPath);
  fs.writeFileSync(outputPath, code)

}
build(graph)