export class ChangeOutPutPath{
  constructor(path){
    console.log('path',path);
    this.path=path
  }
  _apply(hooks){
    hooks.emitFile.tap('changeOutputPath',(context)=>{
      context.ChangeOutPutPath(this.path)
    })
    
  }
}