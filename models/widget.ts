import db from "../libs/database";
import ViewedItem from "../models/viewedItem";
import Sequelize = require("sequelize");

interface IWidget extends Sequelize.Model<any, any> {
  static?:any
}


let Widget:IWidget = db.define<Sequelize.Instance<any>, any>("widget", {
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  settings: Sequelize.STRING(2056)
})

Widget.static = {
}
export default Widget
