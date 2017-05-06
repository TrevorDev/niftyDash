import Command from "nifty-cmd"
import fs = require('fs');
import glob = require("glob")
import mkdirp = require('mkdirp');
import path = require("path")
import objProm from "./libs/objectPromise"
var getDirName = path.dirname

var globPromise = async(path)=>{
	return new Promise((res, rej)=>{
		glob(path, (er, files)=>{
			if(!er){
				res(files)
			}else{
				rej(er)
			}
		})
	})
}

var mkdirpPromise = async(path)=>{
	return new Promise((res, rej)=>{
		mkdirp(path, (er)=>{
			if(!er){
				res()
			}else{
				rej(er)
			}
		})
	})
}

var main = async()=>{
	console.log("npm")
	var command = new Command("npm install", {log: true});
	var result:any = await command.run()
	console.log("done")

	console.log("bower")
	var command = new Command("bower install", {log: true});
	var result:any = await command.run()
	console.log("done")
	
	console.log("tsc:")
	var command = new Command("tsc", {log: true});
	var result:any = await command.run()
	console.log("done")

	// console.log("babel:")
	// var excludedFolders = ["bower_components","node_modules","typings"]
	// var filesToAdd = []
	// var babelFolders = fs.readdirSync("./public/").map((s)=>"public/"+s).concat(["libs"])
	// 	.filter(function(dir){
	// 		return dir.indexOf(".") == -1
	// 	}).filter(function(dir){
	// 		return excludedFolders.indexOf(dir) == -1
	// 	})
	// babelFolders =babelFolders.concat(filesToAdd);
	// var promises = babelFolders.map(async (dir) => {
	// 	console.log("compiling "+dir)
	// 	var compileString = dir.indexOf(".") == -1 ? "babel "+dir+" --out-dir "+dir : "babel "+dir+" --out-file "+dir
	// 	console.log(compileString)
	// 	var command = new Command(compileString, {log: true});
	// 	return command.run()
	// })
	// var res = await objProm(promises);
	// console.log("done")

	console.log("browserify:")
	//TODO this might not catch all files
    var files:any = await globPromise("public/ts/**/*.js") 
	var promises = files.map(async(file)=>{
		console.log(file)
		await mkdirpPromise(getDirName(file.replace("/ts/","/compiledTS/")))
		var cmd = "browserify "+file+" --outfile "+file.replace("/ts/","/compiledTS/")
		var command = new Command(cmd, {log: true});
		return command.run()
	})
	var res = await objProm(promises);
    console.log("done")
}
main()