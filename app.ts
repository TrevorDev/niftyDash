//require("babel/polyfill")

import appFactory from "./libs/appFactory";
import preloadDB from "./libs/preLoadDB";
import browserify = require("browserify")
import config from "./libs/config"

//init modules after db
import db from "./libs/database";
import "./libs/database";
import "./models/models"

import user from "./controllers/user";
import comic from "./controllers/comic";
import spotify from "./controllers/spotify";
import tvShow from "./controllers/tvShow";
import viewedItem from "./controllers/viewedItem";

function watchAsyncError(af){
	return async function(req, resp){
		try{
			await af(req, resp)
		}catch(e){
			console.log(e)
			console.log(e.stack)
		}
	}
}

async function main(){
	//await db.sync({force: true})
	// await preloadDB();
	//console.log(appFactory)
	let app;
	try{
		app = appFactory.createApp();
	}catch(e){
		console.log(e)
		console.log(e.stack)
	}


	app.get('/',async function(req, res) {
		res.render('index')
	});

	app.get("/api/user/getWidgets", watchAsyncError(user.getWidgets))
	app.post("/api/user/create", watchAsyncError(user.create))
	app.post("/api/user/login", watchAsyncError(user.login))
	app.post("/api/user/addWidget", watchAsyncError(user.addWidget))
	app.post("/api/user/saveWidget", watchAsyncError(user.saveWidget))
	app.post("/api/user/deleteWidget", watchAsyncError(user.deleteWidget))
	app.post("/api/viewedItem/add", watchAsyncError(viewedItem.add))
	app.get("/api/user/getViewedItems", watchAsyncError(user.getViewedItems))

	app.get('/api/comic/xkcd/latest', watchAsyncError(comic.xkcd))
	app.get('/api/comic/dilbert/latest', watchAsyncError(comic.dilbert))
	app.get('/api/comic/cAndH/latest', watchAsyncError(comic.cAndH))

	app.get('/api/spotify/latest', watchAsyncError(spotify.topChart))

	app.get('/api/tv/:show', watchAsyncError(tvShow.tv))

	app.get('/browserify/*', function(req, res) {
		//TODO: cache this in production or generate all files beforehand
		let reqFile:string = req.params[0]
		if(config.env == "DEV"){
			let stream = browserify(["./public/ts/"+reqFile]).bundle()
			stream.on("data", function(buffer){
				res.write(buffer)
			})
			stream.on("end", function(){
				res.end()
			})
		}else{
			res.sendfile(reqFile, {root: './public/compiledTS'});
		}
	});

	app.listen(3000, function(){
	    console.log("Server running");
	});
}
try{
	main()
}catch(err){
	console.log("hit")
}
