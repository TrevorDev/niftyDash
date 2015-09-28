import User from "../models/user"
import op from "../libs/objectPromise"

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
    var widgets = await User.static.createDefaultWidgets()
    await op(widgets.map((w)=>u.addWidget(w)))
    res.send(u)
  },
  login: async function(req, res){
    var user = await User.find({where: {account: req.body.account}})
    req.session.userID = user.id;
    res.send({id: user.id})
  },
  getViewedItems: async function(req, res){
    var u = await User.findById(req.session.userID)
    var items = (await u.getViewedItems()).map((i)=>i.item)
    res.send(items)
  }
}
