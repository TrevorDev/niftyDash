require("babel/polyfill")

import $ from "jquery"
import r from "../../../libs/rivetsConfig";
import widgets from "../widgets/widget"
import objectPromise from "../../../libs/objectPromise";

async function main(){

  var ar:Array<string> = (window.location.search.match(/[\?&](.*?)=([^&#]*)/g) || []);
  var params:any = ar.reduce((prev, cur)=>{prev[cur.split("=")[0].slice(1)]=cur.split("=")[1];return prev},{})

  //auth
  //TODO store account in localstorage
  if(!params.account){
    var data = await $.post("/api/user/create")
    params.account = data.account
  }
  var user = await $.post("/api/user/login", {account: params.account})
  var viewedItems = (await $.get("/api/user/getViewedItems")).reduce((prev, cur)=>{prev[cur]=true;return prev},{})

  //setup templates
  var contentview
  var oldH = $('#widgetContent').html()
  var template = {
    widgets: [],
    selectedWidget: null,
    accountUrl: "/?account="+params.account,
    widgetMenuClicked: (event, binding)=>{
      template.selectedWidget = binding.widget
      if(contentview){
        contentview.unbind()
      }
      $('#widgetContent').html(oldH)
      //TODO figure out if it is a bug with rivets that this leaks memory???
      contentview = r.bind($('#widgetContent'), template.selectedWidget)
      $(".rvHide").css("display", "inherit")
      $("#loadingPage").css("display", "none");
    }
  }
  var menuView = r.bind($('#sideMenu'), template)

  //create widgets from users widgets
  template.widgets = (await $.get("/api/user/getWidgets"))
    .map((w) => ({widget: w, class: widgets.widgetList[w.name]}))
    .filter((w) => w.class!=null)
    .map((w) => new w.class(w.widget, viewedItems))

  //TODO clean this up
  template.selectedWidget = template.widgets[0]
  contentview = r.bind($('#widgetContent'), template.selectedWidget)
  $(".rvHide").css("display", "inherit")
  $("#loadingPage").css("display", "none");
  //init all widgets
  await objectPromise(template.widgets.map((w)=>w.init()))
  if(template.widgets.length > 0 && template.selectedWidget == null){
    template.selectedWidget =  template.widgets[0]
  }
}
main()
