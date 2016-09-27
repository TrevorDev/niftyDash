import db from "../libs/database";
import Sequelize = require("sequelize");
// enum WidgetType {
//     NEWSFEED
// }
//
// class Widget{
//   static TYPE=WidgetType;
//   name:string
//   type:WidgetType
// }
//
// class Instance{
//   data:Widget
// }
//
// export default {}
//
// var c:Instance<Widget> = await Widget:Model<Widget>.find(where{name: reddit})
// c.data:Widget.name = "not reddit"
// c.save

// Widget
//   name
//   type/view
//   settings
//
//   init
//   updateNotification
//   customLogic

//TODO make this enum with keys from lib/wigets.ts
let TYPE = {REDDIT: "REDDIT", HN: "HN", XKCD: "XKCD"}

interface IWidget extends Sequelize.Model<any, any> {
  static?:any
}


let Widget:IWidget = db.define<Sequelize.Instance<any>, any>("widget", {
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  settings: Sequelize.STRING(2056)
})

Widget.static = {
  TYPE: TYPE
}
export default Widget
