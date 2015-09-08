import Widget from "../models/widget"
import User from "../models/user"
import op from "../libs/objectPromise"

export default async function(){
  let promises = {
    guest: User.create({username: "guest", password: ""}),
    widgets: [
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
    ]
  }
  let resolved = await op(promises)
  await op(resolved.widgets.map((w)=>resolved.guest.addWidget(w)))
}
