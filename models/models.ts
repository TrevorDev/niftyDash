import * as fs from "fs";

var files = fs.readdirSync(__dirname)
  .filter((file)=>file.indexOf(".js")<0)
  .filter((file)=>file.indexOf("models.ts")<0)
  .map((file)=>file.replace(".ts",""))
for(var i in files){
  require("./"+files[i])
}
