var gulp = require('gulp');
var fs = require('fs');
var exec = require('child_process').exec;
var glob = require("glob")
var mkdirp = require('mkdirp');
var getDirName = require("path").dirname
//TODO make this file in a non hacky way
gulp.task('default', function () {

  console.log("compiling tsc files---------------------------------")
  exec("tsc", function(error, stdout, stderr) {
    if(stderr){
      console.log(stderr)
      console.log("please install typescript. npm install typescript -g")
    }else{
      console.log("done---------------------------------")
      compileBabel(function(){
        //TODO this might not catch all files
        glob("public/ts/**/*.js", function (er, files) {
          console.log("broswerifying output ---------------------------------")
          console.log(files)
          files.forEach(function(file){
            mkdirp(getDirName(file.replace("/ts/","/compiledTS/")), function (err) {
              var cmd = "browserify "+file+" --outfile "+file.replace("/ts/","/compiledTS/")
              console.log(cmd)
              exec(cmd, function(error, stdout, stderr) {
                console.log(stdout)
              });
            })

          })
        })
      })
    }

  });
});

var compileBabel = function(cb){
  var excludedFolders = ["bower_components","node_modules","typings"]
  var filesToAdd = []
  var babelFolders = fs.readdirSync("./public/").map((s)=>"public/"+s).concat(["libs"])
  .filter(function(dir){
    return dir.indexOf(".") == -1
  }).filter(function(dir){
    return excludedFolders.indexOf(dir) == -1
  })
  console.log("compiling tsc output with babel---------------------------------")

  babelFolders =babelFolders.concat(filesToAdd);

  runningCount = babelFolders.length;

  babelFolders.forEach(function(dir){
    console.log("compiling "+dir)
    var compileString = dir.indexOf(".") == -1 ? "babel "+dir+" --out-dir "+dir : "babel "+dir+" --out-file "+dir
    console.log(compileString)
    exec(compileString, function(error, stdout, stderr) {
      if(stderr){
        console.log(stderr)
        console.log("please install babel. npm install babel-cli -g")
      }else{
        console.log(stdout)
        console.log(dir+" done.")
      }
      runningCount--;
      if(runningCount==0){
        console.log("DONE ALL BABEL---------------------------------")
        cb()
      }
    });
  })
}
