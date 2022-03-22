/* 这是打包之后需要生成的js文件 
这里先默认已经完成了打包
实现打包之后的文件格式 */

// 先把main.js 和 foo.js 的文件内容赋值过来

// main.js
// import { add } from "./foo.js";
// console.log('add: ', add);

// console.log(add(2,3));

// foo.js
// export function add(a, b) {
//   return a + b
// }

// 由于可能产生命名冲突的问题，所以给每个单独的文件生成一个函数
function mainJs() {
  // 在esmodule里  import 要写在顶部的作用域里  
  // 所以需要借用commonjs思想  创建require函数
  // import { add } from "./foo.js";
  const add = require('./foo.js')
  console.log('add: ', add);
  console.log(add(2, 3));
}

function fooJs(module){
  // 同理  这里变成module.export
  // export function add(a, b) {
  //   return a + b
  // }
  module.exports = function add(a, b) {
      return a + b
    }
}

function require(filepath){
  // 根据文件路径去找对应的函数
  const map = {
    './foo.js':fooJs,
    './main.js':mainJs
  }
  const module = {
    exports:{}
  }
  // 找到对应的函数并执行
  const fn = map[filepath]
  fn(module)
  // 导出对应函数的module.exports
  return module.exports
}
require('./main.js')
