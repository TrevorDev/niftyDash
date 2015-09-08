require("babel/polyfill")

import $ from "jquery"
import widgets from "../widgets/widget"

async function main(){

  var usersWidgets = await $.get("/api/user/getWidgets")
  usersWidgets = usersWidgets
    .map((w) => ({widget: w, class: widgets.widgetList[w.name]}))
    .filter((w) => w.class!=null)
    .map((w) => new w.class(w.widget))

  var widgetMenu:any = $('#widgetMenu')[0]
  widgetMenu.clickedEvent = function(id){
    alert(id)
  }
  widgetMenu.widgets = usersWidgets
  // usersWidgets[0].notification = "fd"
  // usersWidgets[1].notification = "fd"
  // for(var i in usersWidgets){
  //   await usersWidgets[i].getStories()
  //   usersWidgets[i].notification = usersWidgets[i].stories.length+""
  //   console.log(usersWidgets[i].notification)
  // }
  usersWidgets.map((w, i)=>{
    // w.getStories().then(function(){
    //   widgetMenu.set("widgets."+(i+1)+".notification", w.stories.length+"")
    //   console.log("widgets."+i+".notification")
    // })
    w.getStories().then(function(){
      w.notification = 'jfdjks'
      widgetMenu.set("widgets", usersWidgets.slice())
      console.log(widgetMenu.widgets)
    })
    //w.notification = w.stories.length+""

    //console.log(w.name)
    // console.log(w.name)
    // console.log(w.stories.length)
    //w.notification = "tr"
    // usersWidgets[1] = ""+w.stories.length
    //console.log(w.stories)
    //w.notification = w.stories.length
  })
}
main()
