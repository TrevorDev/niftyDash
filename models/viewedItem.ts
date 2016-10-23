import db from "../libs/database";
import Widget from "../models/widget";

var ViewedItem = db.define("viewedItem", {
  item: db.Sequelize.STRING(512)
})

Widget.hasMany(ViewedItem)
export default ViewedItem
