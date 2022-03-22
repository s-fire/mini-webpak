// 将bundle.js内的文件改成一个立即执行函数,把map作为参数传入
// 并将函数体直接放到对象的属性值内
(
  function(map){
    function require(filepath){
      // 根据文件路径去找对应的函数
      const module = {
        exports:{}
      }
      // 找到对应的函数并执行
      const fn = map[filepath]
      fn(require,module)
      // 导出对应函数的module.exports
      return module.exports
    }
    require('./main.js')
  }
)({
  './foo.js':  function(require,module){
    module.exports = function add(a, b) {
        return a + b
      }
  },
  './main.js':function(require,module) {
    const add = require('./foo.js')
    console.log('add: ', add);
    console.log(add(2, 3));
  }
})