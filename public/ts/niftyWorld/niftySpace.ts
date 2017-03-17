import $ = require("jquery")
import Vue = require("vue");

import Stage from "../../../libs/niftyWorld/objects/stage"
import sceneObjectCreator from "../../../libs/niftyWorld/libs/sceneObjectCreator"
import App from "../../../libs/niftyWorld/objects/app"
import THREE = require("three")
import htmlparser = require("htmlparser2")
import YouTubePlayer = require("youtube-player")

var main = async ()=>{
  var container = document.getElementById('container')
  var stage = Stage.create(container, {enableVR: true})


  var lights = sceneObjectCreator.createLights(stage)
  var controllers = sceneObjectCreator.createControllers(stage)

  var geometry = new THREE.Geometry();
  geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
  geometry.vertices.push( new THREE.Vector3( 0, 0, - 1 ) );
  var line = new THREE.Line( geometry );
  line.name = 'line';
  line.scale.z = 5;

  controllers.left.add( line.clone() );

  sceneObjectCreator.createIsland(stage)

  var elementID="textInput"
  // $("#body").append("<div id='"+elementID+"' style='position: absolute;left: 0px;top: 0px;font-size: 10em;background-color:#718D99'>Hello!</div>")
  // var textInputElement = $("#"+elementID);
  // var textInput = sceneObjectCreator.htmlViewer(stage, textInputElement)
  // document.onkeypress = function (e) {
  //     e = e || window.event;
  //     console.log(e.keyCode)
  // };

  var resp = await $.get("https://www.youtube.com/feed/trending")
  //console.log(resp)

  var vids = []
  var parser = new htmlparser.Parser({
      onopentag: function(name, attribs:any){
          var classes:string = attribs.class ? attribs.class : ""
          if(name === "div" && classes.indexOf("yt-lockup yt-lockup-tile")!=-1){
              vids.push({id: attribs['data-context-item-id'], img: null, mesh: null})
          }
          if(name == "img" && vids[vids.length-1] != null){
            if(attribs.src.indexOf("http") != -1){
              vids[vids.length-1].img = attribs.src
            }else{
              vids[vids.length-1].img = attribs["data-thumb"]
            }
            
          }
      },
      ontext: function(text){
          //console.log("-->", text);
      },
      onclosetag: function(tagname){
          if(tagname === "script"){
              //console.log("That's it?!");
          }
      }
  }, {decodeEntities: true});
  parser.write(resp);
  parser.end();
  console.log(vids)
  console.log("done")

  vids.forEach((v, i)=>{
      //image
      //console.log(v.img)
   
      new THREE.TextureLoader().load(v.img, function(map){
           var geo = new THREE.PlaneGeometry(3,3)
      var mat = new THREE.MeshLambertMaterial()
      var mesh = new THREE.Mesh(geo, mat)
        mat.map = map
          mesh.position.z -= 8
          mesh.position.x += ((i%4) * 4)+5
          mesh.position.y += ((Math.floor(i/4)) * -4)+5
      v.mesh = mesh
      stage.scene.add( mesh );
      })

  })


  elementID="player"
  $("#body").append("<div id='"+elementID+"' style='position: absolute;left: 0px;top: 0px;z-index: -1000;'></div>")
  var player = YouTubePlayer(elementID);
  player.loadVideoById('q6EoRBvdVPQ');
  player.playVideo().then(()=>{
    var video:any = $("video", $("#"+elementID).contents()[0])[0]
    var vidMesh = sceneObjectCreator.createVideo(stage, video)
    vidMesh.position.z -= 10
  })

  // elementID="twitch"
  // $("#body").append('<iframe id="'+elementID+'" src="https://player.twitch.tv/?channel=jcarverpoker&html5" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>')
  // var twitchIFrame = $("#"+elementID)
  // console.log("hit")
  // console.log(twitchIFrame.contents())
  // var video:any = $("video", twitchIFrame.contents()[0])[0]
  // var vidMesh = sceneObjectCreator.createVideo(stage, video)
  // vidMesh.position.z -= 10

  stage.startRender((delta, time)=>{
    controllers.left.update()
    controllers.right.update()

    
    if(controllers.left.getButtonPressedState("trigger") == "down"){
      var raycaster = new THREE.Raycaster();
      var tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation( controllers.left.matrixWorld );
      raycaster.ray.origin.setFromMatrixPosition( controllers.left.matrixWorld );
      raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( tempMatrix );
      var inter = raycaster.intersectObjects(vids.map((v)=>{return v.mesh}))
      if(inter[0]){
        var vid = vids.find((v)=>{return v.mesh == inter[0].object})
        console.log(vid)
        player.loadVideoById(vid.id);
      }
      
    }
  })
}
$(document).ready(()=>{
  main()
})
