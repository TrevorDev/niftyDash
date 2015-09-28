import $ from "jquery"
import hn from "../../../libs/hn";
class Widget {
  name = "Widget"
  notification = "..."
  settings = null
  constructor(widget, public viewedItems){
    this.settings = JSON.parse(widget.settings)
    //console.log(this.settings)
  }
  init = async function(){

  }
  updateNotification = async function(){

  }
}

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
      this.stories = this.stories.filter((s)=>s.id != binding.story.id)
      $.post("/api/viewedItem/add", {item: binding.story.id})
      await this.updateNotification()
    },0)
  }
}

class Story{
  constructor(public id, public title, public url, public commentsUrl){

  }
}

class redditWidget extends newsfeedWidget {
  name = "Reddit"
  getStories = async function(){
    var res = await $.get("http://www.reddit.com/r/"+this.settings.subreddits+"/top.json?limit="+this.settings.limit)
    var widget = this;
    this.stories = res.data.children
      .map((i)=>new Story(widget.name+i.data.id, i.data.title, i.data.url, "https://www.reddit.com"+i.data.permalink))
      .filter((i)=> !this.viewedItems[i.id])
    await this.updateNotification()
  }
}

class hackerNewsWidget extends newsfeedWidget {
  name = "Hacker News"
  getStories = async function(){
    var widget = this;
    this.stories = (await hn.getTopStories(100))
      .map((i)=>new Story(widget.name+i.id,i.title, i.url, "https://news.ycombinator.com/item?id="+i.id))
      .filter((i)=> !this.viewedItems[i.id])
    await this.updateNotification()
  }
}

var widgetList = {
  REDDIT: redditWidget,
  HN: hackerNewsWidget
}

export default {
  widgetList: widgetList
}
