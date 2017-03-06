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

var main = async ()=>{
  //create stage
  var container = document.getElementById('container')
  var stage = Stage.create(container, {enableVR: true})

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
    SceneRunner.runObjects(delta, stage, player, creation, originMesh.scale.x)

    SceneRunner.runDragController(controllers.controllerDrag, stage, originMesh, creation)
    SceneRunner.runPlaceController(controllers.controllerPlace, stage, originMesh, brickCreator, creation)
  })
}

$(document).ready(()=>{
  main()
})
