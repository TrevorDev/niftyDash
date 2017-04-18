require("babel-polyfill");

import appFactory from "./libs/appFactory";
import browserify = require("browserify")
import config from "./libs/config"

//init modules after db
import db from "./libs/database";
import "./libs/database";
import "./models/models"

import user from "./controllers/user";
import comic from "./controllers/comic";
import youtube from "./controllers/youtube";
import spotify from "./controllers/spotify";
import tvShow from "./controllers/tvShow";
import viewedItem from "./controllers/viewedItem"

import request = require("request-promise")
import $ = require("cheerio")
import parser = require('rss-parser');

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
	if(process.argv[2] == "p"){
		process.env.NODE_ENV = 'production'
	}
	//await db.sync({force: true})
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
	app.get('/blog',async function(req, res) {
		res.render('niftyBlog')
	});
	app.get('/blog/:post',async function(req, res) {
		var resp = await  request("https://medium.com/@trevorbaron/"+req.params.post)
		var post = $("div.section-content", resp).html()
		res.render('niftyBlogPost', {post: post})
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
	})
	app.get('/niftyRendering',async function(req, res) {
		res.render('niftyRendering')
	})

	app.get("/api/user/getWidgets", watchAsyncError(user.getWidgets))
	app.post("/api/user/create", watchAsyncError(user.create))
	app.post("/api/user/login", watchAsyncError(user.login))
	app.post("/api/user/addWidget", watchAsyncError(user.addWidget))
	app.post("/api/user/saveWidget", watchAsyncError(user.saveWidget))
	app.post("/api/user/deleteWidget", watchAsyncError(user.deleteWidget))
	app.post("/api/viewedItem/add", watchAsyncError(viewedItem.add))
	app.get("/api/user/getViewedItems", watchAsyncError(user.getViewedItems))
	app.get("/api/blog/latest" ,async function(req, res) {
		parser.parseURL("https://medium.com/feed/@trevorbaron", (err, x)=>{
			var posts = x.feed.entries.map((e)=>{
				var id = e.link.split("/")[4].split("?")[0]
				return {name: e.title, link: "/blog/"+id,id: id}
			})
			console.log(posts)
			res.send(posts)
		})
	});
	//THESE ARE CACHED to update this see appFactory.ts
	app.get('/api/comic/xkcd/latest', watchAsyncError(comic.xkcd))
	app.get('/api/comic/dilbert/latest', watchAsyncError(comic.dilbert))
	app.get('/api/comic/cAndH/latest', watchAsyncError(comic.cAndH))
	app.get('/api/comic/smbc/latest', watchAsyncError(comic.smbc))
	app.get('/api/youtube/latest', watchAsyncError(youtube.trending))
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
			
			console.log("Env: "+process.env.NODE_ENV)
			//TODO what do i do for compiling ts?????????????
			if(process.env.NODE_ENV != 'production'){
				//TODO print output from this
				//exec("tsc --watch")
			}
	});
}
try{
	main()
}catch(err){
	console.log("hit")
}
