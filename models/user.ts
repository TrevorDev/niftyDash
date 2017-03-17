import db from "../libs/database"
import ViewedItem from "../models/viewedItem";
import Widget from "../models/widget";
import Sequelize = require("sequelize")
import op from "../libs/objectPromise"
interface userS extends Sequelize.Instance<any> {
  addWidget:any;
  getWidgets:any;
  removeWidget:any;
  addViewedItem:any;
  getViewedItems:any;
  id:number;
}

interface IUser extends Sequelize.Model<userS, any> {
  static?:any
}

var User:IUser = db.define<userS, any>("user", {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  account: Sequelize.STRING(512)
})
User.static = {
}

User.hasMany(Widget)
export default User
