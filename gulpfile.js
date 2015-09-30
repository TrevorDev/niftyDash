var gulp = require('gulp');
var fs = require('fs');
var exec = require('child_process').exec;

gulp.task('default', function () {

  console.log("compiling tsc files")
  exec("tsc", function(error, stdout, stderr) {
    if(stderr){
      console.log(stderr)
      console.log("please install typescript. npm install typescript -g")
    }else{
      console.log("done.")
      compileBabel()
    }

  });
});

var compileBabel = function(){
  var babelFolders = fs.readdirSync("./")
  .filter(function(dir){
    return dir.indexOf(".") == -1
  }).filter(function(dir){
    return ["bower_components","node_modules","typings"].indexOf(dir) == -1
  })
  console.log("compiling tsc output with babel")
  babelFolders.forEach(function(dir){
    console.log("compiling "+dir)
    exec("babel "+dir+" --out-dir "+dir, function(error, stdout, stderr) {
      if(stderr){
        console.log(stderr)
        console.log("please install babel. npm install babel -g")
      }else{
        console.log(dir+" done.")
      }
    });
  })
  console.log("compiling app.js")
  exec("babel app.js --out-file app.js", function(error, stdout, stderr) {
    if(stderr){
      console.log(stderr)
      console.log("please install babel. npm install babel -g")
    }else{
      console.log("app.js done.")
    }
  });
}
