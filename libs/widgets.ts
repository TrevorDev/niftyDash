import $ from "jquery"
import hn from "./hn";hn;//dont know why i need to do this???
//base
class Widget {
  static defaultSettings = {}
  static type = "Widget"
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
  storyClicked = async (event, binding)=>{
    setTimeout(async ()=>{
      console.log(this.name)
      console.log(binding.story.title)
      console.log(binding.story.id)
      $.post("/api/viewedItem/add", {item: binding.story.id})
      this.stories = this.stories.filter((s)=>s.id != binding.story.id)

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
    static defaultSettings = JSON.stringify({
      subreddits: "TODAYILEARNED+WORLDNEWS+ASKREDDIT+TECHNOLOGY+BESTOF+IAMA+SMASHBROS+MUSIC+HIPHOPHEADS+COMICS+PROGRAMMERHUMOR+FUTUROLOGY+PROGRAMMING+PERSONALFINANCE+GAMEDEV+ENTREPRENEUR+INVESTING+MASHUPS+FINANCIALINDEPENDENCE+RETIREDGIF+LIGHTBULB+STARTUPS+ZENHABITS+SMALLBUSINESS+NODE+CODING+INDIEGAMES+DATASETS+SOMEBODYMAKETHIS+ENTREPRENEURRIDEALONG+SIDEPROJECT+RUNITUP+ENTREPENEUR+CODEPROJECTS+SMALLBUISNESS+NODEJS+KOAJS+NOBADCONTENT+COMBOHYPE",
      limit: 100
    })
    getStories = async function(){
      var res = await $.get("http://www.reddit.com/r/"+this.settings.subreddits+"/top.json?limit="+this.settings.limit)
      var widget = this;
      this.stories = res.data.children
        .map((i)=>new Story(widget.name+i.data.id, i.data.title, i.data.url, "https://www.reddit.com"+i.data.permalink))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  HN: class hackerNewsWidget extends newsfeedWidget {
    static type = "HN"
    static defaultSettings = JSON.stringify({
      limit: 100
    })
    getStories = async function(){
      var widget = this;
      this.stories = (await hn.getTopStories(this.settings.limit))
        .map((i)=>new Story(widget.name+i.id,i.title, i.url, "https://news.ycombinator.com/item?id="+i.id))
        .filter((i)=> !this.viewedItems[i.id])
      await this.updateNotification()
    }
  },
  XKCD: class xkcdWidget extends newsfeedWidget {
    static type = "XKCD"
    static defaultSettings = JSON.stringify({})
    getStories = async function(){
      var widget = this;
      this.stories = (await $.get("/api/comic/xkcd/latest"))
        .map((i)=>new Story(widget.name+i.name,i.name, i.link, i.link))
        .filter((i)=> !this.viewedItems[i.name])
      await this.updateNotification()
    }
  }
}

export default {
  widgetList: widgetList
}
