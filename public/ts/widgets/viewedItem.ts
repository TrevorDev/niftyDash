var loggedIn = false
var getRead = async function(){
  if(loggedIn){

  }else{
    return JSON.parse(localStorage["viewedItems"]) || []
  }
}
var markRead = async function(item){
  if(loggedIn){

  }else{
    var array = await getRead()
    array.push(item)
    localStorage["viewedItems"] = JSON.stringify(array)
  }
}

export default {
  getRead: getRead,
  markRead: markRead
}
