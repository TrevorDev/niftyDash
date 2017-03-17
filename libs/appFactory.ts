import express = require("express")
import bodyParser = require("body-parser")
import session = require("express-session")
import config from "../libs/config"
import connect_cache = require("connect-cache")

export default {
	createApp: function(){
		var c = require('connect')
		for(var key in c){
			console.log(key)
		}

		var app = express();
		app.set('views', __dirname + '/../views');
		app.set('view engine', 'jade');
		app.set('view options', { layout: false });

		//TODO factor this out this file is meant to be universal to al lprojects
		if(process.env.NODE_ENV == 'production'){
			var minuite = 60000
			app.use(connect_cache({rules: [
				{regex: /.*?api\/comic/, ttl: minuite*5},
				{regex: /.*?api\/spotify/, ttl: minuite*5},
				{regex: /.*?api\/youtube/, ttl: minuite*5}
			]}))
		}

		//TODO make this secret and move to config.ts
		app.use(session({
		  secret: config.session.secret,
		  resave: false,
		  saveUninitialized: true
		}))
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(bodyParser.json());

		app.use("/public", express.static(__dirname + '/../public'))
		app.use("/bower_components", express.static(__dirname + '/../bower_components'));
		app.use("/views", function(req, res){
			//console.log(req.url)
				res.render('../views/'+req.url.substr(1), function(e, html){
					if(e){
						res.status(404)
						res.end()
						//res.send("Cannot GET /views" + req.url)
					}else{
						res.send(html)
					}
				})
		})

		return app
	}
}
