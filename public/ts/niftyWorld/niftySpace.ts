import $ = require("jquery")
import Vue = require("vue");

import Stage from "../../../libs/niftyWorld/objects/stage"
import sceneObjectCreator from "../../../libs/niftyWorld/libs/sceneObjectCreator"
import App from "../../../libs/niftyWorld/objects/app"
import THREE = require("three")
// import htmlparser = require("htmlparser2")
// import YouTubePlayer = require("youtube-player")



//audio webrtc
// function gotStream(stream) {
//     window.AudioContext = window.AudioContext || window.webkitAudioContext;
//     var audioContext = new AudioContext();

//     // Create an AudioNode from the stream
//     var mediaStreamSource = audioContext.createMediaStreamSource(stream);

//     // Connect it to destination to hear yourself
//     // or any other node for processing!
//     mediaStreamSource.connect(audioContext.destination);
// }

// navigator.getUserMedia({audio:true}, gotStream);

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
  sceneObjectCreator.createSkybox(stage)
  sceneObjectCreator.createIsland(stage)
  sceneObjectCreator.createLand(stage)

  // var video = document.createElement( 'video' );
  // video.src = 'http://127.0.0.1:8083/127.0.0.1:8080/movie4.ogg';
  // video.type="video/ogg; codecs=theora,vorbis"
  // video.setAttribute('crossorigin', 'anonymous');
  // video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
  // video.play();
  // var vidMesh = sceneObjectCreator.createVideo(stage, video)
  // vidMesh.position.z -= 10

  stage.startRender((delta, time)=>{
    controllers.left.update()
    controllers.right.update()

    
    // if(controllers.left.getButtonPressedState("trigger") == "down"){
    //   var raycaster = new THREE.Raycaster();
    //   var tempMatrix = new THREE.Matrix4();
    //   tempMatrix.identity().extractRotation( controllers.left.matrixWorld );
    //   raycaster.ray.origin.setFromMatrixPosition( controllers.left.matrixWorld );
    //   raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( tempMatrix );
    //   var inter = raycaster.intersectObjects(vids.map((v)=>{return v.mesh}))
    //   if(inter[0]){
    //     var vid = vids.find((v)=>{return v.mesh == inter[0].object})
    //     console.log(vid)
    //     player.loadVideoById(vid.id);
    //   }
    // }
  })
}
$(document).ready(()=>{
  main()
})
