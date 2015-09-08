import User from "../models/user"

export default {
  getWidgets: async function(req, res){
    //User
    var guest = await User.find({where: {username: "guest"}})
    var widgets = await guest.getWidgets()
    res.send(widgets)
  }
}
