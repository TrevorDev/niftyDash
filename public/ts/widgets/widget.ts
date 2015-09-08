import $ from "jquery"

class newsfeedWidget {
  stories = []
  name = "Widget"
  notification = "..."
  settings = null
  constructor(widget){
    this.settings = JSON.parse(widget.settings)
    //console.log(this.settings)
  }
  getStories = async function(){

  }
  init = async function(widget){
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
      console.log("here")
  }
}

class hackerNewsWidget extends newsfeedWidget {
  name = "Hacker News"
  getStories = async function(){
    await $.get("http://www.reddit.com/r/science/top.json")
  }
}

var widgetList = {
  REDDIT: redditWidget,
  HN: hackerNewsWidget
}

export default {
  widgetList: widgetList
}
