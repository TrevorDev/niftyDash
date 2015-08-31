require("babel/polyfill")

import appFactory from "./libs/appFactory";

//init modules after db
import db from "./libs/database";
import "./libs/database";
import "./models/models";

import user from "./controllers/user";


async function main(){
	await db.sync({force: true})
	let app = appFactory.createApp();

	app.get('/',async function(req, res) {
		res.render('index')
	});

	app.get("/api/user/getWidgets", user.getWidgets)

	app.listen(3000, function(){
	    console.log("Server running");
	});
}
main()
