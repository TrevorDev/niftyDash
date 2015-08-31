import db from "../libs/database"

let WidgetSetting = db.define("widgetSetting", {
  name: db.Sequelize.STRING
})

export default WidgetSetting
