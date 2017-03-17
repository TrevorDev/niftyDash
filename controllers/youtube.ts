import request = require("request-promise")
import regexMatch from "../libs/regexMatch"
import htmlparser = require("htmlparser2")

export default {
  trending: async function(req, res){
   var resp = await request("https://www.youtube.com/feed/trending")

    var vids = []
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs:any){
            var classes:string = attribs.class ? attribs.class : ""
            if(name === "div" && classes.indexOf("yt-lockup yt-lockup-tile")!=-1){
                vids.push({id: attribs['data-context-item-id'], img: null, mesh: null})
            }
            if(name == "a" && classes.indexOf("yt-uix-tile-link")!= -1){
              vids[vids.length-1].name = attribs.title
            }
            if(name == "img" && vids[vids.length-1] != null){
              if(attribs.src.indexOf("http") != -1){
                vids[vids.length-1].img = attribs.src
              }else{
                vids[vids.length-1].img = attribs["data-thumb"]
              }
              
            }
        },
        ontext: function(text){
            //console.log("-->", text);
        },
        onclosetag: function(tagname){
            if(tagname === "script"){
                //console.log("That's it?!");
            }
        }
    }, {decodeEntities: true});
    parser.write(resp);
    parser.end();
  	res.send(vids.map((v)=>{return {id:v.id, name: v.name, link:"https://www.youtube.com/watch?v="+v.id}}))
  }
}
