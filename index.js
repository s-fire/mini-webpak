import fs from 'fs'
import parser from '@babel/parser'
import traverse from "@babel/traverse"
import path from 'path'
import ejs from 'ejs'
import { transformFromAst } from "babel-core";
function creatAsset(filePath){
  // 读取文件内容
  const source = fs.readFileSync(filePath,{
    encoding:'utf-8'
  })
  // 获取依赖关系(@babel/parser)
  const ast = parser.parse(source,{
    sourceType:'module'
  })
  // console.log('ast: ', ast);
  // 从ast树里取出依赖的文件 @babel/traverse
  // 定义数组存储依赖的文件
  const deps =[]
  traverse.default(ast,{
    ImportDeclaration({node}){
      // console.log('node: ', node);
      deps.push(node.source.value)
    }
  })
  // 将import语法转换为require(babel-core)
  const {code} =  transformFromAst(ast,null,{
    presets:['env'] //这里需要引入babel-preset-env 否则会报错
  })

  return {
    filePath,
    code,
    deps
  }
}
// 获取依赖关系图的函数
function createGraph(){
  // 获取主文件依赖
  const mainAsset = creatAsset('./example/main.js')
  // 创建依赖关系图数组[{soure:'',deps:[]},{soure:'',deps:[]}]
  const queue = [mainAsset]
  for (const asset of queue) {
    // 取出各依赖文件的路劲
    asset.deps.forEach(relativePath=>{
      // 再分析各依赖文件的依赖
      const child = creatAsset(path.resolve('./example',relativePath))
      // 添加到依赖关系图数组里
      queue.push(child)
    })
  }
  return queue
}
const graph = createGraph()

// 实现打包函数
function build(graph){
  // 引入ejs 根据设定的模板转换代码
  // 读取模板文件
  const template= fs.readFileSync('./bundle.ejs',{encoding:'utf-8'})
  const code = ejs.render(template,{graph})
  fs.writeFileSync('./dist/bundle.js',code)
}
build(graph)