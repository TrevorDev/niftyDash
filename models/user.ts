import db from "../libs/database"
import ViewedItem from "../models/viewedItem";
import Widget from "../models/widget";
import Sequelize from "sequelize";
interface userS extends Sequelize.Instance<any, any> {
  addWidget:any;
  getWidgets:any;
}
var User = db.define<userS, any>("user", {
  username: Sequelize.STRING,
  password: Sequelize.STRING
})

User.hasMany(ViewedItem)
User.hasMany(Widget)
export default User
