import $ = require("jquery")
import Vue = require("vue");
//TODO use better three imporrts
import THREE = require("three")
import Stage from "../../../libs/niftyWorld/objects/stage"
import sceneObjectCreator from "../../../libs/niftyWorld/libs/sceneObjectCreator"

var main = async ()=>{
	var container = document.getElementById('container')
	var stage = Stage.create(container, {enableVR: false})

	var lights = sceneObjectCreator.createLights(stage)

	var island = sceneObjectCreator.createIsland(stage);
	island.position.set(0,-3,0)



	stage.startRender((delta, time)=>{
		island.rotateY(delta/800)
	})
}

main();