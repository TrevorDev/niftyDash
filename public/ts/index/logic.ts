//import $ = require("jquery")
require("babel-polyfill");
import Vue = require("vue");
import widgets from "../../../libs/widgets";
import objectPromise from "../../../libs/objectPromise";
var Awesomplete = require('awesomplete')

async function main(){
  //get url params
  var ar:Array<string> = (window.location.search.match(/[\?&](.*?)=([^&#]*)/g) || []);
  var params:any = ar.reduce((prev, cur)=>{prev[cur.split("=")[0].slice(1)]=cur.split("=")[1];return prev},{})

  //AUTH
  //TODO store account in localstorage
  var newUser = false
  var localstorageParam = localStorage.getItem("account");
  if(!params.account){
    if(localstorageParam){
      //TODO clean up this localstorage logic
      params.account = localstorageParam;
    }else{
      var data = await $.post("/api/user/create")
      params.account = data.account
      newUser = true
    }
  }
  var user = await $.post("/api/user/login", {account: params.account})
  localStorage.setItem("account", params.account);

  if(newUser){
    //ADD DEFAULT WIDGETS
    var adds = [
        widgets.widgetList.REDDIT.type,
        widgets.widgetList.HN.type,
        widgets.widgetList.XKCD.type
      ].map((a)=>{
      var formData = {
        type: a,
        name: widgets.widgetList[a].friendlyName
      }
      return $.post("/api/user/addWidget", formData)
    })
    await objectPromise(adds)
  }
  var accountUrl = "?account="+params.account
  window.history.replaceState(null, null, window.location.pathname+accountUrl);

  //QUOTE
  var comments = [
    'Listen to the kids bro',
    'I can’t let these people play me Name one genius that ain\'t crazy',
    'I miss the old Kanye',
    'I turn the six upside down, it\'s a nine now',
    'My thesis will smash a stereo to pieces',
    'Went to Burger King, they spit in my onion rings',
    'I\'m not a \'Business-Man\'! I\'m a Business... man! Let me handle my business, damn!',
    'Why you gotta fight with me at cheesecake',
    'Chop the top off the Porsche, that\'s a headless horse',
    'I\'m not out of control, I\'m just not in they control'
  ]
  var topMsg = '"'+comments[Math.floor(Math.random()*comments.length)]+'"'

  //get users widgets
  var viewedItems = (await $.get("/api/user/getViewedItems")).reduce((prev, cur)=>{prev[cur]=true;return prev},{})
  var usersWidgets = (await $.get("/api/user/getWidgets"))
    .map((w) => ({widget: w, class: widgets.widgetList[w.type]}))
    .filter((w) => w.class!=null)
    .map((w) => new w.class(w.widget, viewedItems))

  //show hidden things while vue is loading
  $(".hidden").css("visibility", "inherit")
  $("#loadingPage").css("display", "none");

  //initialize template
  var template = {
    topMsg: topMsg,
    widgets: usersWidgets,
    selectedWidget: usersWidgets[0],
    accountUrl: accountUrl,
    displayConfig:false,
    checkedWidgets: usersWidgets.map((w)=>w.constructor.type)
  }
  const app:any = new Vue({
    el: '#app',
    data: template,
    methods: {
      widgetMenuClicked: (widget)=>{
        template.selectedWidget = widget
      },
      configClicked: ()=>{
        template.displayConfig = !template.displayConfig

        setTimeout(async ()=>{
          var redditWidget = template.widgets.filter((w)=> w.constructor.type == "REDDIT")[0]
          if(redditWidget){
            $('#autocomp').val(redditWidget.settings.subreddits.split("+").join(", "))
            //TODO go to the end of the input box
            // $('#autocomp').focus(function(){
            //   setTimeout(async ()=>{this.selectionStart = this.selectionEnd = 10000;}, 0)
            // })
          }else{
            $('#autocomp').val("AskReddit, AskScience, todayilearned, lifeprotips, lifehacks, futurology, iama, technology, gaming, gifs, news, space, worldnews")
          }

          new Awesomplete('#autocomp', {
          	filter: function(text, input) {
          		return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
          	},

          	replace: function(text) {
          		var before = this.input.value.match(/^.+,\s*|/)[0];
          		this.input.value = before + text + ", ";
          	}
          });
        }, 0)
      },
      storyClicked: async (story)=>{
        //this was needed to not delete wrong element
        setTimeout(async ()=>{
          $.post("/api/viewedItem/add", {widgetId:template.selectedWidget.id, item: story.id})
          template.selectedWidget.stories = template.selectedWidget.stories.filter((s)=>s.id != story.id)

          await template.selectedWidget.updateNotification()
        },0)
      },
      submitSettings:async ()=>{
        var toAdd = template.checkedWidgets.filter((val)=>template.widgets.reduce((acc, w)=> acc && (w.constructor.type != val) ,true))
        var toRemove = template.widgets.filter(w => !template.checkedWidgets.reduce((acc, val)=>acc  || (w.constructor.type == val),false))

        var adds = toAdd.map((a)=>{
            var formData = {
              type: a,
              name: widgets.widgetList[a].friendlyName
            }
            return $.post("/api/user/addWidget", formData)
        })

        var removals = toRemove.map((w)=>{
          var formData = {
            id: w.id
          }
          return $.post("/api/user/deleteWidget", formData)
        })
        await objectPromise(removals)
        await objectPromise(adds)

        var redditWidget = template.widgets.filter((w)=> w.constructor.type == "REDDIT")[0]
        if(redditWidget){
          var formData:any = {
            id: template.selectedWidget.id,
            settings: JSON.stringify({
              subreddits: $('#autocomp').val().replace(/\s/g, "").split(",").join("+"),
              limit: 100
            })
          }
          //this should be put but jquery doesnt care enuf
          await $.post("/api/user/saveWidget", formData)
        }

        console.log("done!")
        location.reload();
      },
      createNewAccount: ()=>{
        localStorage.clear();
        window.location.href = "/";
      }
    }
  })

  $('[data-toggle="offcanvas"]').click(function () {
    $('.row-offcanvas').toggleClass('active')
  });

  $("#content").on("swipe",function(){
    $('.row-offcanvas').toggleClass('active')
    //$(this).hide();
  });

  var chosenOnes = []

  document.onkeypress = function (e) {
      var event:any = e || window.event;
      var story = template.selectedWidget.stories[0]
      if(story != null){
        if(event.keyCode == "a".charCodeAt(0)){
          app.storyClicked(story)
        }else if(event.keyCode == "d".charCodeAt(0)){
          chosenOnes.push(story.commentsUrl ? story.commentsUrl : story.url)
          app.storyClicked(story)
        }
      }else if(event.keyCode == "s".charCodeAt(0)){
        chosenOnes.forEach((url)=>{
          window.open(url)
        })
        chosenOnes = []
      }
  };

  //load widgets
  await objectPromise(usersWidgets.map((w)=>w.init()))
}
main();
