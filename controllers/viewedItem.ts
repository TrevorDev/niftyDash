import ViewedItem from "../models/viewedItem"
import User from "../models/user"
import Widget from "../models/widget"
import op from "../libs/objectPromise"

export default {
  add: async function(req, res){
    //TODO: widget should belong to user
    var u = await User.findById(req.session.userID)
    var w = await Widget.findById(req.body.widgetId)
    var vi = await ViewedItem.create({item: req.body.item})
    await w.addViewedItem(vi)
    console.log("done")
    //var widgets = await u.getWidgets()
    res.send({})
  }
}
