import db from "../libs/database"
import ViewedItem from "../models/viewedItem";
import Widget from "../models/widget";
import Sequelize = require("sequelize")
import op from "../libs/objectPromise"
interface userS extends Sequelize.Instance<any> {
  addWidget:any;
  getWidgets:any;
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
  createDefaultWidgets: async function(){
    return await op([
      Widget.create({
          name: Widget.static.TYPE.REDDIT,
          type: Widget.static.TYPE.REDDIT,
          settings: JSON.stringify({
            subreddits: "TODAYILEARNED+WORLDNEWS+ASKREDDIT+TECHNOLOGY+BESTOF+IAMA+SMASHBROS+MUSIC+HIPHOPHEADS+COMICS+PROGRAMMERHUMOR+FUTUROLOGY+PROGRAMMING+PERSONALFINANCE+GAMEDEV+ENTREPRENEUR+INVESTING+MASHUPS+FINANCIALINDEPENDENCE+RETIREDGIF+LIGHTBULB+STARTUPS+ZENHABITS+SMALLBUSINESS+NODE+CODING+INDIEGAMES+DATASETS+SOMEBODYMAKETHIS+ENTREPRENEURRIDEALONG+SIDEPROJECT+RUNITUP+ENTREPENEUR+CODEPROJECTS+SMALLBUISNESS+NODEJS+KOAJS+NOBADCONTENT+COMBOHYPE",
            limit: 100
          })
      }),
      Widget.create({
        name: Widget.static.TYPE.HN,
        type: Widget.static.TYPE.HN,
        settings: JSON.stringify({
          limit: 100
        })
      })
    ])
  }
}

User.hasMany(Widget)
export default User
