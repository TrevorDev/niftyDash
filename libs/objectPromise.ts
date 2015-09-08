async function e(obj){

  if(typeof obj.then === "function"){
    return await obj
  }else if(obj.constructor === Array){
    return await Promise.all(obj)
  }else if(typeof obj === "object"){
    let ret = {}
    for(let key in obj){
      ret[key] = await e(obj[key])
    }
    return ret
  }

  return obj
}

export default e
