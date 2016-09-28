let method = function(regexStr:string, content:string){
  var ret = []
  if(!regexStr || !content){
    return ret;
  }
  var regex = new RegExp(regexStr, "g")
  var match = []
  while (match = regex.exec(content)) {
    ret.push(match)
  }
  return ret;
}



export default method
