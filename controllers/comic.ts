import request = require("request-promise")

export default {
  xkcd: async function(req, res){
    //TODO cache this to not spam requests from server
    var result:any = await request('http://xkcd.com/info.0.json');
    var num = JSON.parse(result).num;
  	var latest = []
    for(var i = num-19;i<=num;i++){
        latest.push({link: "http://xkcd.com/"+i, name: i, id: i})
    }
    res.send(latest)
  },
  cAndH: async function(req, res){
    var result:any = await request('http://feeds.feedburner.com/Explosm');
  	var latest = result.match(/www.explosm.net\/comics\/(\d+)/g); //HACKY WAY BECAUSE THEY DONT HAVE API
  	latest = latest.map(function(i){
  		return i.match(/\d+/)[0];
  	})
  	latest = latest.reduce(function(p, c)	{
  		if (p.indexOf(c) < 0) p.push(c);
  		return p;
  	}, []).map(function(i){
  		return {link: "http://explosm.net/comics/"+i, name: i, id: i};
  	})
  	res.send(latest)
  },
  dilbert: async function(req, res){
    var result:any = await request('http://feeds.feedburner.com/DilbertDailyStrip');
    var latest = result.match(/\d+\-\d+\-\d+/g);
  	latest = latest.reduce(function(p, c)//uniq
  	{
  		if (p.indexOf(c) < 0) p.push(c);
  		return p;
  	}, [])
  	.map(function(i){
  		return {link: "http://dilbert.com/strip/"+i, name: i, id: i};
  	})
  	res.send(latest)
  }
}
