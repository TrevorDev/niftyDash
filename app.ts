require("babel-polyfill");

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

var exec = require('child_process').exec;

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
	app.get('/niftyStuff',async function(req, res) {
		res.render('niftyNews')
	});
	app.get('/classic',async function(req, res) {
		res.render('classic')
	});
	app.get('/niftyWorld',async function(req, res) {
		res.render('niftyWorld')
	});
	app.get('/niftyWorldEditor',async function(req, res) {
		res.render('niftyWorldEditor')
	});
	app.get('/niftySpace',async function(req, res) {
		res.render('niftySpace')
	});

	app.get("/api/user/getWidgets", watchAsyncError(user.getWidgets))
	app.post("/api/user/create", watchAsyncError(user.create))
	app.post("/api/user/login", watchAsyncError(user.login))
	app.post("/api/user/addWidget", watchAsyncError(user.addWidget))
	app.post("/api/user/saveWidget", watchAsyncError(user.saveWidget))
	app.post("/api/user/deleteWidget", watchAsyncError(user.deleteWidget))
	app.post("/api/viewedItem/add", watchAsyncError(viewedItem.add))
	app.get("/api/user/getViewedItems", watchAsyncError(user.getViewedItems))

	//THESE ARE CACHED to update this see appFactory.ts
	app.get('/api/comic/xkcd/latest', watchAsyncError(comic.xkcd))
	app.get('/api/comic/dilbert/latest', watchAsyncError(comic.dilbert))
	app.get('/api/comic/cAndH/latest', watchAsyncError(comic.cAndH))
	app.get('/api/spotify/latest', watchAsyncError(spotify.topChart))

	app.get('/api/tv/:show', watchAsyncError(tvShow.tv))

	app.get('/browserify/*', function(req, res) {
		//TODO: cache this in production or generate all files beforehand
		let reqFile:string = req.params[0]
		if(process.env.NODE_ENV != "production"){
			console.log("browserify start")
			console.log(require.resolve("vue"))

			//TODO do i need these?
			//insertGlobals: true, detectGlobals: false,

			let stream = browserify(["./public/ts/"+reqFile], {noParse: [require.resolve("vue"), require.resolve("jquery"), require.resolve("three")]}).bundle()
			stream.on("data", function(buffer){
				res.write(buffer)
			})
			stream.on("end", function(){
				res.end()
				console.log("browserify done")
			})
		}else{
			res.sendFile(reqFile, {root: './public/compiledTS'});
		}
	});

	app.listen(3000, function(){
	    console.log("Server running");
			if(process.argv[2] == "p"){
				process.env.NODE_ENV = 'production'
			}
			console.log("Env: "+process.env.NODE_ENV)

			if(process.env.NODE_ENV != 'production'){
				//TODO print output from this
				exec("tsc --watch")
			}
	});
}
try{
	main()
}catch(err){
	console.log("hit")
}
