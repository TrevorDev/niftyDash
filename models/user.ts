import db from "../libs/database"
import ViewedItem from "../models/viewedItem";
import Widget from "../models/widget";
import Sequelize from "sequelize";
import op from "../libs/objectPromise"
interface userS extends Sequelize.Instance<any, any> {
  addWidget:any;
  getWidgets:any;
  addViewedItem:any;
  getViewedItems:any;
  id:number;
}
var User = db.define<userS, any>("user", {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  account: Sequelize.STRING(512)
})
User.static = {
  createDefaultWidgets: async function(){
    return await op([
      Widget.create({
          name: Widget.static.NAME.REDDIT,
          type: Widget.static.TYPE.NEWSFEED,
          settings: JSON.stringify({
            subreddits: "TODAYILEARNED+WORLDNEWS+ASKREDDIT+TECHNOLOGY+BESTOF+IAMA+SMASHBROS+MUSIC+HIPHOPHEADS+COMICS+PROGRAMMERHUMOR+FUTUROLOGY+PROGRAMMING+PERSONALFINANCE+GAMEDEV+ENTREPRENEUR+INVESTING+MASHUPS+FINANCIALINDEPENDENCE+RETIREDGIF+LIGHTBULB+STARTUPS+ZENHABITS+SMALLBUSINESS+NODE+CODING+INDIEGAMES+DATASETS+SOMEBODYMAKETHIS+ENTREPRENEURRIDEALONG+SIDEPROJECT+RUNITUP+ENTREPENEUR+CODEPROJECTS+SMALLBUISNESS+NODEJS+KOAJS+NOBADCONTENT+COMBOHYPE",
            limit: 100
          })
      }),
      Widget.create({
        name: Widget.static.NAME.HN,
        type: Widget.static.TYPE.NEWSFEED,
        settings: JSON.stringify({
          limit: 100
        })
      })
    ])
  }
}

User.hasMany(ViewedItem)
User.hasMany(Widget)
export default User
