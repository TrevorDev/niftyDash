import request = require("request-promise")
import regexMatch from "../libs/regexMatch"

export default {
  topChart: async function(req, res){
    //TODO cache this to not spam requests from server
    var result:any = await request('https://spotifycharts.com/regional/us/daily/latest');
    var latest = regexMatch('href="https://open.spotify.com/track/(.*?)"[^]*?<td class="chart-table-track">[^]*?<strong>(.*?)</strong>[^]*?<span>(.*?)</span>', result).map((m)=>{
      return {link: "https://play.spotify.com/track/"+m[1], name: m[2]+" "+m[3], id: m[0]}
    }).slice(0, 100);

    res.send(latest)
  }
}
