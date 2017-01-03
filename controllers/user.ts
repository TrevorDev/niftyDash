import User from "../models/user"
import Widget from "../models/widget"
import widgets from "../libs/widgets";
import op from "../libs/objectPromise"
var x = 3
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
export default {
  getWidgets: async function(req, res){
    var u = await User.findById(req.session.userID)
    var widgets = await u.getWidgets()
    res.send(widgets)
  },
  create: async function(req, res){
    var u = await User.create({account: guid()})
    // var widgets = await User.static.createDefaultWidgets()
    // await op(widgets.map((w)=>u.addWidget(w)))
    res.send(u)
  },
  login: async function(req, res){
    var user = await User.find({where: {account: req.body.account}})
    req.session.userID = user.id;
    res.send({id: user.id})
  },
  getViewedItems: async function(req, res){
    var u = await User.findById(req.session.userID)
    var widgets = await u.getWidgets()
    var items = (await op(widgets.map((w)=>w.getViewedItems({order: [['createdAt', 'DESC']], limit: 200})))).reduce((prev, current)=>{return prev.concat(current)}, []).map((i)=>i.item)
    res.send(items)
  },
  addWidget: async function(req, res){
    //TODO add error handling
    console.log(req.body.type)
    console.log(widgets.widgetList[req.body.type])
    var u = await User.findById(req.session.userID)
    var w = await Widget.create({
        name: req.body.name,
        type: req.body.type,
        settings: widgets.widgetList[req.body.type].defaultSettings
    })
    u.addWidget(w)
    res.send()
  },
  saveWidget: async function(req, res){
    //TODO add error handling
    var u = await User.findById(req.session.userID)
    console.log("\n\n\n")
    console.log(req.body)
    var w = await u.getWidgets({where:{id: req.body.id}})
    console.log(w.length)
    w[0].settings = req.body.settings
    w[0].name = req.body.name
    await w[0].save()
    res.send()
  },
  deleteWidget: async function(req, res){
    var u = await User.findById(req.session.userID)
    var w = (await u.getWidgets({where:{id: req.body.id}}))[0]
    await u.removeWidget(w)
    res.send()
  }
}
