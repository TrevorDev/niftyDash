import request = require("request-promise")

export default {
  tv: async function(req, res){
    var show = req.params.show
    var rootUrl = 'http://projectfreetv.us/internet/';
  	var result:any = await request(rootUrl+show);
    var latestSeasonReg = new RegExp('<td class="mnlcategorylist" width="99%"><a href="(.*?)"', "g")
    var latestSeasonUrl = ""
    while (matches = latestSeasonReg.exec(result)) {
      latestSeasonUrl = rootUrl+"/"+matches[1]
    }
    result = await request(latestSeasonUrl);

  	var regex = new RegExp('<a href="(.*?)" title="(.*?)" style="text-decoration: none; color: black;">', "g")

  	var matches, output = [];
  	while (matches = regex.exec(result)) {
        var link = matches[1]
        var seasonEpRegex = new RegExp('season-(.*?)/episode-(.*?)/', "g")
        var match = seasonEpRegex.exec(link)
        var season = parseInt(match[1])
        var episode = parseInt(match[2])
  	    output.push({
  	    	season: season,
  	    	episode: episode,
          id: "("+show+") S"+season+"-E"+episode,
  	    	link: link
  	    });
  	}
  	output = output.filter(function(e){
  		return e.links != 0;
  	}).slice(0, 5);
  	res.send(output)
  }
}
