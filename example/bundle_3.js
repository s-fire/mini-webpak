// 在没有解决路径问题之前生成的bundle.js文件
// 需要通过给每个文件一个单独的id和创建对应的路径id映射来解决
// 需要的文件结构见bundle_4.js
/* (
  function (map) {
    function require(filepath) {
      const module = {
        exports: {}
      }
      const fn = map[filepath]
      fn(require, module)
      return module.exports
    }
    require('./example/main.js')
  }
)({

  "./example/main.js": function (require, module) {
    "use strict";

    var _foo = require("./foo.js");

    console.log('add: ', _foo.add);
    console.log((0, _foo.add)(2, 3));
  }
    
     "/Users/gly/Documents/Personal/Code/mini-vue/mini-webpack/example/foo.js": function (require, module) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.add = add;

    function add(a, b) {
      return a + b;
    }
  }

}); */