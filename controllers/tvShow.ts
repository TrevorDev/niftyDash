import request = require("request-promise")

export default {
  tv: async function(req, res){
    var show = req.params.show
  	var result:any = await request('http://www.solarmovie.is/tv/'+show);
  	var regex = new RegExp('<a href="/tv/'+show+'/season-(\\d+)/episode-(\\d+)/" class="linkCount typicalGrey">\\s*(\\d+) links</a>', "g")
  	var matches, output = [];
  	while (matches = regex.exec(result)) {
  	    output.push({
  	    	season: parseInt(matches[1]),
  	    	episode: parseInt(matches[2]),
          id: "("+show+") S"+parseInt(matches[1])+"-E"+parseInt(matches[2]),
  	    	links: parseInt(matches[3]),
  	    	link: "http://www.solarmovie.is/tv/"+show+"/season-"+matches[1]+"/episode-"+matches[2]
  	    });
  	}
  	output = output.filter(function(e){
  		return e.links != 0;
  	}).slice(0, 5);
  	res.send(output)
  }
}
