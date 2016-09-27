import $ = require("jquery")
import Vue = require("vue");
import widgets from "../../../libs/widgets";
import objectPromise from "../../../libs/objectPromise";

async function main(){
  //get url params
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
  var contentview:any = {$destroy:()=>{}}
  var origView = $('#widgetContent').html()

  var template = {
    widgets: [],
    selectedWidget: null,
    accountUrl: "/?account="+params.account,
    displayConfig:false,
    widgetMenuClicked: (widget)=>{
      template.selectedWidget = widget
      contentview.$destroy()
      $('#widgetContent').html(origView)
      contentview = new Vue({
        el: '#widgetContent',
        data: template.selectedWidget,
        methods: template.selectedWidget
      })
      $(".hidden").css("display", "inherit")
      $("#loadingPage").css("display", "none");
    },
    configClicked: ()=>{
      template.displayConfig = !template.displayConfig
    },
    addWidget: async (e)=>{
      e.preventDefault();
      $("#addMsg").html("please wait...")
      console.log("one")
      console.log($("#addMsg").html())
      var formData = $("#addForm").serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
      }, {})
      await $.post("/api/user/addWidget", formData)
      $("#addMsg").html("Done! Please refresh the page to see changes.")
    },
    saveWidget: async (e)=>{
      e.preventDefault();
      $("#saveMsg").html("please wait...")
      var formData:any = $("#saveForm").serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
      }, {})
      formData.id = template.selectedWidget.id;
      console.log(formData)
      //this should be put but jquery doesnt care enuf
      await $.post("/api/user/saveWidget", formData)
      $("#saveMsg").html("Done! Please refresh the page to see changes.")
    }
  }

  //binding sidemenu
  window.history.replaceState(null, null, template.accountUrl);

  //todo get rid of this var?
  var methods:any = template;
  var sideMenu = new Vue({
    el: '#sideMenu',
    data: template,
    methods: methods
  })
  var widgetConfig = new Vue({
    el: '#widgetConfig',
    data: template,
    methods: methods
  })

  //create widgets from users widgets
  template.widgets = (await $.get("/api/user/getWidgets"))
    .map((w) => ({widget: w, class: widgets.widgetList[w.type]}))
    .filter((w) => w.class!=null)
    .map((w) => new w.class(w.widget, viewedItems))

  //TODO clean this up
  template.widgetMenuClicked(template.widgets[0]);

  //init all widgets
  await objectPromise(template.widgets.map((w)=>w.init()))
  if(template.widgets.length > 0 && template.selectedWidget == null){
    template.selectedWidget =  template.widgets[0]
  }
}
main()
