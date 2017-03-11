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

function iframeRef( frameRef ) {
    return frameRef.contentWindow
        ? frameRef.contentWindow.document
        : frameRef.contentDocument
}

var main = async ()=>{



  //create stage
  var container = document.getElementById('container')
  var stage = Stage.create(container, {enableVR: true})

  $('#btn').click(()=>{
    var video:any = $("video", $('#frame').contents()[0])[0]
    var vidMesh = SceneObjectCreator.createVideo(stage, video)
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
  })

  //create scene objects
  var lights = SceneObjectCreator.createLights(stage)
  var skybox = SceneObjectCreator.createSkybox(stage)
  var island = SceneObjectCreator.createIsland(stage)
  var controllers = SceneObjectCreator.createControllers(stage)
  var originMesh = SceneObjectCreator.createOrigin(stage)

  var player = SceneObjectCreator.createPlayer(stage)
  originMesh.add(player.body)
  var brickCreator = new BlockCreator();
  controllers.controllerPlace.add(brickCreator.body)

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

    SceneRunner.runDragController(controllers.controllerDrag, stage, originMesh, creation)
    SceneRunner.runPlaceController(controllers.controllerPlace, stage, originMesh, brickCreator, creation)
  })
}

$(document).ready(()=>{
  main()
})
