require("babel/polyfill")

import appFactory from "./libs/appFactory";
import preloadDB from "./libs/preLoadDB";
import browserify from "browserify"

//init modules after db
import db from "./libs/database";
import "./libs/database";
import "./models/models";

import user from "./controllers/user";


async function main(){
	// await db.sync({force: true})
	// await preloadDB();
	let app = appFactory.createApp();

	app.get('/',async function(req, res) {
		res.render('index')
	});

	app.get("/api/user/getWidgets", user.getWidgets)

	app.get('/browserify/*', function(req, res) {
		//TODO: cache this in production or generate all files beforehand
		let reqFile:string = req.params[0]
		let stream = browserify(["./public/ts/"+reqFile]).bundle()
		stream.on("data", function(buffer){
			res.write(buffer)
		})
		stream.on("end", function(){
			res.end()
		})
	});

	app.listen(3000, function(){
	    console.log("Server running");
	});
}
main()
