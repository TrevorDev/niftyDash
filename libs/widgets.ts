import $ = require("jquery")
import hn from "./hn";hn;//dont know why i need to do this???
import op from "../libs/objectPromise";op;
import regexMatch from "../libs/regexMatch"

//base
class Widget {
  static defaultSettings = {}
  static type = "Widget"
  static friendlyName = "Widget"
  name = "";
  id:number;
  notification = "<i class='fa fa-refresh fa-spin'></i>"
  settings = null
  settingsString = null
  constructor(widget, public viewedItems){
    this.id = widget.id
    this.name = widget.name;
    this.settings = JSON.parse(widget.settings)
    this.settingsString = JSON.stringify(this.settings, null, 4)
    //console.log(this.settings)
  }
  init = async function(){

  }
  updateNotification = async function(){

  }
}

//viewTypes
class newsfeedWidget extends Widget {
  stories = []
  init = async function(){
    await this.getStories()
  }
  getStories = async function(){

  }
  updateNotification = async function(){
    this.notification = this.stories.length+""
  }
  storyClicked = async (story)=>{
    setTimeout(async ()=>{
      console.log(this.name)
      console.log(story.title)
      console.log(story.id)
      $.post("/api/viewedItem/add", {widgetId:this.id, item: story.id})
      this.stories = this.stories.filter((s)=>s.id != story.id)

      await this.updateNotification()
    },0)
  }
}
class Story{
  constructor(public id, public title, public url, public commentsUrl){

  }
}


//TODO add better default name or rename types to be better
var widgetList = {
  REDDIT: class redditWidget extends newsfeedWidget {
    static type = "REDDIT"
    static friendlyName = "Reddit"
    static defaultSettings = JSON.stringify({
      subreddits: "AskReddit+AskScience+todayilearned+lifeprotips+lifehacks+futurology+iama+technology+gaming+gifs+news+space+worldnews",
      limit: 100
    })
    getStories = async function(){
      var res = await $.get("http://www.reddit.com/r/"+this.settings.subreddits+"/top.json?limit="+this.settings.limit)
      var widget = this;
      this.stories = res.data.children
        .map((i)=>new Story(widget.name+i.data.id, i.data.title+" ▲"+i.data.score, i.data.url, "https://www.reddit.com"+i.data.permalink))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  HN: class hackerNewsWidget extends newsfeedWidget {
    static type = "HN"
    static friendlyName = "Hacker News"
    static defaultSettings = JSON.stringify({
      limit: 100
    })
    getStories = async function(){
      var widget = this;
      this.stories = (await hn.getTopStories(this.settings.limit))
        .map((i)=>new Story(widget.name+i.id,i.title + " ▲"+i.score, i.url, "https://news.ycombinator.com/item?id="+i.id))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  TOP_SPOTIFY: class TopSotifyWidget extends newsfeedWidget {
    static type = "TOP_SPOTIFY"
    static friendlyName = "Music"
    static defaultSettings = JSON.stringify({})
    getStories = async function(){
      var widget = this;
      this.stories = (await $.get("/api/spotify/latest"))
        .map((i)=>new Story(widget.name+i.id,i.name, i.link, i.link))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  XKCD: class xkcdWidget extends newsfeedWidget {
    static type = "XKCD"
    static friendlyName = "XKCD"
    static defaultSettings = JSON.stringify({})
    getStories = async function(){
      var widget = this;
      this.stories = (await $.get("/api/comic/xkcd/latest"))
        .map((i)=>new Story(widget.name+i.id,i.name, i.link, i.link))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  CANDH: class cAndHWidget extends newsfeedWidget {
    static type = "CANDH"
    static friendlyName = "C and H"
    static defaultSettings = JSON.stringify({})
    getStories = async function(){
      var widget = this;
      this.stories = (await $.get("/api/comic/cAndH/latest"))
        .map((i)=>new Story(widget.name+i.id,i.name, i.link, i.link))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  DILBERT: class dilbertWidget extends newsfeedWidget {
    static type = "DILBERT"
    static friendlyName = "Dilbert"
    static defaultSettings = JSON.stringify({})
    getStories = async function(){
      var widget = this;
      this.stories = (await $.get("/api/comic/dilbert/latest"))
        .map((i)=>new Story(widget.name+i.id,i.name, i.link, i.link))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  TV: class tvWidget extends newsfeedWidget {
    static type = "TV"
    static friendlyName = "TV"
    static defaultSettings = JSON.stringify({
      shows: ["silicon-valley-watch-online"]
    })
    getStories = async function(){
      var widget = this;
      this.stories = (await op(this.settings.shows.map((s)=>{
        return ($.get("/api/tv/"+s))
      })))
      .reduce((prev, cur)=>{return prev.concat(cur.map((ep)=>new Story(widget.name+ep.id, ep.id, ep.link, ep.link)))},[])
      .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  }
}

export default {
  widgetList: widgetList
}
