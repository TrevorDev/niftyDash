import request from "request-promise"

export default {
  xkcd: async function(req, res){
    //TODO cache this to not spam requests from server
    var result:any = await request('http://xkcd.com/info.0.json');
    var num = JSON.parse(result).num;
  	var latest = []
    for(var i = num-19;i<=num;i++){
        latest.push({link: "http://xkcd.com/"+i, name: i})
    }
  	console.log(latest)
    res.send(latest)
  }
}
