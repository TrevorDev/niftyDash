import ViewedItem from "../models/viewedItem"
import User from "../models/user"
import op from "../libs/objectPromise"

export default {
  add: async function(req, res){
    var u = await User.findById(req.session.userID)
    var vi = await ViewedItem.create({item: req.body.item})
    await u.addViewedItem(vi)
    console.log("done")
    //var widgets = await u.getWidgets()
    res.send({})
  }
}
