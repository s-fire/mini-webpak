// 1、改变立即执行函数的实参数据结构
// 2、改变require函数 改为根据传入进来的id去映射map里找文件

(
  function (map) {
    function require(id) {
      const module = {
        exports: {}
      }
      // 这里根据Id可以得到一数组  进行解构
      const [fn,mapping] = map[id]
      // 但是由Babel转换后的代码的require函数传入过来的参数是'./foo.js'字符串
      // 所以需要进行转换,根据字符串路径找到对应的函数的Id
      function localRequire(filePath){
        const id = mapping[filePath]
        return require(id)
      }
      // 再把这个转换函数传给代代码进行转换,babel转换后的代码会调用exports,所以也需要把exports传进去
      fn(localRequire, module,module.exports)
      return module.exports
    }
    require(1)
  }
)({

  1: [function (require, module,exports) {
    "use strict";

    var _foo = require("./foo.js");

    console.log('add: ', _foo.add);
    console.log((0, _foo.add)(2, 3));
  },
  {
    './foo.js':2
  }],

  2: [function (require, module,exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.add = add;

    function add(a, b) {
      return a + b;
    }
  },
  // foo.js没有引入文件 所以是个空对象
  {}
  ]

});