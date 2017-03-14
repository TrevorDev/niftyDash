//require("babel-polyfill");

import $ = require("jquery")
import Vue = require("vue");

import Stage from "../../../libs/niftyWorld/objects/stage";
import Block from "../../../libs/niftyWorld/objects/block";
import Character from "../../../libs/niftyWorld/objects/character";
import Controller from "../../../libs/niftyWorld/objects/controller";
import SceneObjectCreator from "../../../libs/niftyWorld/libs/sceneObjectCreator";
import SceneRunner from "../../../libs/niftyWorld/libs/sceneRunner";
import BlockCreator from "../../../libs/niftyWorld/objects/blockSpawner";
import MATERIALS from "../../../libs/niftyWorld/libs/materials"
import OBJLoader from "../../../libs/niftyWorld/threeExtensions/OBJLoader"
import BlockType from "../../../libs/niftyWorld/objects/blockType"
import ViveController from "../../../libs/niftyWorld/threeExtensions/ViveController"
import OBJExporter from "../../../libs/niftyWorld/threeExtensions/OBJExporter"
import THREE = require("three")
import html2canvas = require("html2canvas")
import YouTubePlayer = require("youtube-player")

function iframeRef( frameRef ) {
    return frameRef.contentWindow
        ? frameRef.contentWindow.document
        : frameRef.contentDocument
}

var main = async ()=>{



  //create stage
  var container = document.getElementById('container')
  var stage = Stage.create(container, {enableVR: true})

  //$('#btn').click(()=>{
    // var iframe = $('<iframe src="https://www.youtube.com/embed/uVuBqTQTqRQ" height="200" width="300"></iframe>') 
    // var video:any = $("video", iframe.contents()[0])[0]
    // var vidMesh = SceneObjectCreator.createVideo(stage, video)


    var player = YouTubePlayer('player');
     
    // 'loadVideoById' is queued until the player is ready to receive API calls. 
    player.loadVideoById('q6EoRBvdVPQ');
     
    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called. 
    player.playVideo().then(()=>{
      var video:any = $("video", $("#player").contents()[0])[0]
      console.log($("#player").contents()[0])
      console.log(video)
      var vidMesh = SceneObjectCreator.createVideo(stage, video)
      vidMesh.position.z -= 10
    })
    
      // var tag = document.createElement('script');
      // tag.src = "https://www.youtube.com/iframe_api";
      // var firstScriptTag = document.getElementsByTagName('script')[0];
      // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      // var player;
      // function onYouTubeIframeAPIReady() {
      //   player = new YT.Player('player', {
      //     height: '390',
      //     width: '640',
      //     videoId: 'M7lc1UVf-VE',
      //     events: {
      //       'onReady': onPlayerReady,
      //       'onStateChange': onPlayerStateChange
      //     }
      //   });
      // }
      // function onPlayerReady(event) {
      //   event.target.playVideo();
      // }
      // var done = false;
      // function onPlayerStateChange(event) {
      //   if (event.data == YT.PlayerState.PLAYING && !done) {
      //     setTimeout(stopVideo, 6000);
      //     done = true;
      //   }
      // }
      // function stopVideo() {
      //   player.stopVideo();
      // }



    // console.log(video)
    // var canvas = document.createElement("canvas");
    // canvas.width = video.videoWidth;
    // canvas.height = video.videoHeight;
    // canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    // document.body.appendChild(canvas);
    // html2canvas($("video", $('#frame').contents()[0])[0]).then(function(canvas) {
    //     document.body.appendChild(canvas);
    // });
    //"D:\Downloads\chromium_webvr_v1.1_win (2)\Chrome-bin\chrome.exe" --disable-web-security --user-data-dir="c:/someFolderName"
  //})

  //create scene objects
  var lights = SceneObjectCreator.createLights(stage)
  var skybox = SceneObjectCreator.createSkybox(stage)
  var island = SceneObjectCreator.createIsland(stage)
  var controllers = SceneObjectCreator.createControllers(stage)
  var originMesh = SceneObjectCreator.createOrigin(stage)

  var player = SceneObjectCreator.createPlayer(stage)
  originMesh.add(player.body)
  var brickCreator = new BlockCreator();
  controllers.right.add(brickCreator.body)

  var creation = {
    cubes: {}
  }

  //FOR DEBUGGING, auto start vr
  setTimeout(()=>{stage.VREffect.requestPresent()},100)

  //main loop
  stage.startRender((delta, time)=>{
    //update objects
    player.update(delta)
    SceneRunner.runObjects(delta, stage, player, creation)

    SceneRunner.runDragController(controllers.left, stage, originMesh, creation)
    SceneRunner.runPlaceController(controllers.right, stage, originMesh, brickCreator, creation)
  })
}

$(document).ready(()=>{
  main()
})
