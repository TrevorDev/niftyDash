import db from "../libs/database";

var ViewedItem = db.define("viewedItem", {
  item: db.Sequelize.STRING(512)
})

export default ViewedItem
