export function jsonLoader(source){
  // json文件没有到处关键字，需要手动导出关键字
  this.addDep('jsonLoader')
  return `export default ${JSON.stringify(source)}`
}