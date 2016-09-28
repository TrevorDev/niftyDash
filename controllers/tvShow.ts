import request = require("request-promise")
import regexMatch from "../libs/regexMatch"

export default {
  tv: async function(req, res){
    var show = req.params.show
    var rootUrl = 'http://projectfreetv.us/internet/';

    //getLatestSeasonURL
  	var result:any = await request(rootUrl+show);
    var latestSeasonUrl = regexMatch('<td class="mnlcategorylist" width="99%"><a href="(.*?)"', result).map((m)=>rootUrl+"/"+m[1]).pop()
    if(latestSeasonUrl == ""){
      res.send(output)
      return
    }

    //getEpisodesInLatestSeason
    result = await request(latestSeasonUrl);
    var output = regexMatch('<a href="(.*?)" title="(.*?)" style="text-decoration: none; color: black;">', result).map((m)=>{
      var link = m[1]
      var seasonAndEpisode = regexMatch('season-(.*?)/episode-(.*?)/', link)[0]
      var season = parseInt(seasonAndEpisode[1])
      var episode = parseInt(seasonAndEpisode[2])
      return {
        season: season,
        episode: episode,
        id: "("+show+") S"+season+"-E"+episode,
        link: link
      };
    }).slice(0, 5);

  	res.send(output)
  }
}
