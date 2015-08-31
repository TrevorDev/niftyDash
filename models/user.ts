import db from "../libs/database"
import ViewedItem from "../models/viewedItem";

var User = db.define("user", {
  username: db.Sequelize.STRING,
  password: db.Sequelize.STRING
})

User.hasMany(ViewedItem)
export default User
