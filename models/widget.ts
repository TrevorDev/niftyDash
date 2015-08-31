import db from "../libs/database";

let TYPE = {NEWSFEED: "NEWSFEED"}

let Widget = db.define("widget", {
  name: db.Sequelize.STRING,
  type: db.Sequelize.ENUM(TYPE.NEWSFEED)
})

export default Widget
