//require("babel-polyfill");

import $ = require("jquery")
import Vue = require("vue");

import Stage from "../../../libs/niftyWorld/objects/stage";
import Block from "../../../libs/niftyWorld/objects/block";
import Character from "../../../libs/niftyWorld/objects/character";
import Controller from "../../../libs/niftyWorld/objects/controller";
import BlockCreator from "../../../libs/niftyWorld/objects/blockSpawner";
import MATERIALS from "../../../libs/niftyWorld/libs/materials"
import OBJLoader from "../../../libs/niftyWorld/threeExtensions/OBJLoader"
import BlockType from "../../../libs/niftyWorld/objects/blockType"
import ViveController from "../../../libs/niftyWorld/threeExtensions/ViveController"
import OBJExporter from "../../../libs/niftyWorld/threeExtensions/OBJExporter"
import THREE = require("three")

var main = async ()=>{
  var container = document.getElementById('container')
  var stage = Stage.create(container, {enableVR: true})

  //lighting
  var ambiant = new THREE.AmbientLight(0xFFFFFF, 0.1);
  stage.scene.add(ambiant);

  var point1 = new THREE.PointLight()
  point1.position.y += 3
  point1.position.z += 3
  stage.scene.add(point1);

  var point2 = new THREE.PointLight()
  point2.position.y += 0
  point2.position.x += 2
  stage.scene.add(point2);
  // var light = new THREE.PointLight( 0xFFFFFF, 10, 10000 );
  // light.position.set( 20, 50, -200 );
  // var lightGeo = new THREE.SphereBufferGeometry( 20, 32, 15 );
  // var lightMesh = new THREE.Mesh( lightGeo, MATERIALS.MOON )
  // light.add( lightMesh );
  // light.castShadow = true;
  // stage.scene.add( light );

  //skybox
  var skyGeo = new THREE.SphereBufferGeometry( 450000, 32, 15 );
  var skyMesh = new THREE.Mesh( skyGeo, MATERIALS.SKY );
  stage.scene.add( skyMesh );

  //island
  var island = new THREE.Object3D()
  var islandGroundGeo = new THREE.SphereGeometry( 5,5,5, 0, Math.PI, 0, Math.PI );
  var islandGround = new THREE.Mesh( islandGroundGeo, MATERIALS.SAND );
  islandGround.rotation.x = -Math.PI/2
  islandGround.scale.z = 0.5
  island.castShadow = true;
  var treeGeo = new THREE.BoxGeometry( 0.3, 6, 0.3 );
  var treeMesh = new THREE.Mesh( treeGeo, MATERIALS.DEFAULT )
  treeMesh.position.y = 3
  var leafGeo = new THREE.BoxGeometry( 2, 2, 2 );
  var leafMesh = new THREE.Mesh( leafGeo, MATERIALS.LEAF )
  leafMesh.position.y = 3
  treeMesh.add(leafMesh)
  island.add(treeMesh)
  island.add(islandGround)
  island.position.y = -5;
  island.position.z = -10;
  island.position.x = 20;
  stage.scene.add( island );

  //image
  // new THREE.TextureLoader().load('http://i.imgur.com/EifdOn0.jpg', function(map){
  //   var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true } );
  //   var sprite = new THREE.Sprite( material );
  //   stage.scene.add( sprite );
  // })

  //origin
  var originGeo = new THREE.BoxGeometry( 1, 1, 1 );
  var originMesh = new THREE.Mesh( originGeo, MATERIALS.DEFAULT )
  originMesh.position.set(-1.5,1,0)
  var originMeshScale = 0.03
  originMesh.scale.set(originMeshScale,originMeshScale,originMeshScale)
  stage.scene.add( originMesh );
  var creation = {
    cubes: {}
  }
  var lastKey = ""

  //controllers
  var controllerDrag = new ViveController( 0 );
  controllerDrag.standingMatrix = stage.VRControls.getStandingMatrix();
  stage.scene.add( controllerDrag );
  var controllerPlace = new ViveController( 1 );
  controllerPlace.standingMatrix = stage.VRControls.getStandingMatrix();
  stage.scene.add( controllerPlace );
  var loader = new OBJLoader(undefined);
	loader.setPath( '/public/models/' );
  var realCont:any
	loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {
		var loader = new THREE.TextureLoader();
		loader.setPath( '/public/models/' );
		var controller = object.children[ 0 ];
		controller.material.map = loader.load( 'onepointfive_texture.png' );
		controller.material.specularMap = loader.load( 'onepointfive_spec.png' );
		controllerDrag.add( object.clone() );
    realCont = object.clone()
		controllerPlace.add( realCont );
	} );

  //player
	var controller = new Controller({
		up: "w",
		down: "s",
		left: "a",
		right: "d",
		jump: " ",
		rotX: "mouseX",
		rotY: "mouseY",
		click: "mouseLeft"
	}, {
    slot: 0,
  	controls: {
  		left: {axis: 0, value: function(val){
  			return (val < -0.40)
  		}},
      right: {axis: 0, value: function(val){
  			return (val > 0.40)
  		}},
      up: {axis: 1, value: function(val){
  			return (val < -0.40)
  		}},
      down: {axis: 1, value: function(val){
  			return (val > 0.40)
  		}},
      rotX: {axis: 2, value: function(val){
        if(Math.abs(val) < 0.2){
          return 0
        }
  			return val*-50
  		}},
      rotY: {axis: 3, value: function(val){
        if(Math.abs(val) < 0.2){
          return 0
        }
  			return val*-50
  		}},
      jump: {button: 3}
  	}
  })
	var player = new Character(controller);
  // stage.scene.add(player.body)
  // THREE.SceneUtils.attach(originMesh, stage.scene, controllerDrag)
  originMesh.add(player.body)


  var brickCreator = new BlockCreator();
  controllerPlace.add(brickCreator.body)

  //FOR DEBUGGING, auto start vr
  setTimeout(()=>{stage.VREffect.requestPresent()},100)

  //main loop
  stage.startRender((delta, time)=>{
    player.update(delta)

    var blocks = []
    for(var key in creation.cubes){
      blocks.push(creation.cubes[key])
    }
    var axisDone = []
    blocks.forEach((block, i)=>{
      //console.log(i + " "+block.type)
      //Enemy movement
      if(block.type == BlockType.ENEMY1){
        var towardsVec = player.body.position.clone().sub(block.body.position)
        if(towardsVec.length() < 20){
          block.body.position.add(towardsVec.multiplyScalar(0.01))
          block.update()
        }
      }

      //Handle collisions
      block.update() //TODO this shouldnt be needed
      var collision = player.collider.clone().intersect(block.collider)
      if(!collision.isEmpty()){
        if(block.type == BlockType.BLOCK){

          var overlap = collision.max.clone().sub(collision.min)

          //TODO FIX THIS CODE, the for loop is insane
          var found = true
          for(var i = 0; i < 3 && found;i++){
            found = false
            var axis = ""

            //find which axis to handle the collision
            if(overlap.x != 0 && overlap.x <= overlap.y && overlap.x <= overlap.z){
              axis = "x"
            }else if(overlap.y != 0 && overlap.y <= overlap.x && overlap.y <= overlap.z){
              axis = "y"
            }else if(overlap.z != 0 && overlap.z <= overlap.y && overlap.z <= overlap.x){
              axis = "z"
            }

            if(axis!="" && axisDone.indexOf(axis) == -1){
              //determine which side of the axis the collision occured
              var posDirAdj = collision.max[axis] != player.collider.max[axis]

              //handle aabb adjacent block issue by not handling physics for adjacent walls
              var adjPos = new THREE.Vector3(
                (block.gridPos.x + (axis == 'x' ? (!posDirAdj ? -1 : 1) : 0)),
                (block.gridPos.y + (axis == 'y' ? (!posDirAdj ? -1 : 1) : 0)),
                (block.gridPos.z + (axis == 'z' ? (!posDirAdj ? -1 : 1) : 0))
              )
              var nextBlock = blocks.filter((b)=>{
                return adjPos.equals(b.gridPos)
              })[0]
              if(!nextBlock){
                //only do collision once per axis per frame
                //TODO avoid this by updating aabb so collision wont occur multiple times
                axisDone.push(axis)

                //collision adjustment
                console.log(overlap[axis])
                player.body.position[axis] += (posDirAdj ? overlap[axis]*(1/originMeshScale) : -overlap[axis]*(1/originMeshScale))//TODO: this shouldnt need to be done
                if(player.spd[axis] <= 0 && posDirAdj){
                  player.spd[axis]=0;
                }else if(player.spd[axis] > 0 && !posDirAdj){
                  player.spd[axis]=0;
                }

                //apply friction when touching ground
                if(axis == "y"){
                  player.jumpDown = false
                  //TODO this is all wrong
                  player.jumps = player.maxJumps
                  var up = new THREE.Vector3(0,1,0)
                  var adj = up.clone().cross(player.walkDir)
                  var len = player.spd.clone().dot(player.walkDir.normalize())
                  if(len < 0){
                    //apply friction to all
                    player.spd.multiplyScalar(Math.pow(0.99,delta))
                  }else{
                    //apply friction only to adjacent axis to dir
                    var spdInWalk =  player.walkDir.clone().normalize().multiplyScalar(len)
                    var rest = player.spd.clone().sub(spdInWalk)
                    var fric = rest.clone().multiplyScalar(Math.pow(0.99,delta))
                    player.spd = fric.clone().add(spdInWalk)
                  }
                }
                found=true
              }else{
                overlap[axis] = Number.MAX_VALUE
              }
            }else{
              found=true
            }
          }
        }else if(block.type == BlockType.GOAL){
          // var curLevel = parseInt(level)
          // curLevel++
          // location.href = "/niftyWorld?level="+curLevel;
        }else if(block.type == BlockType.DEATH){
          player.reset()
        }else if(block.type == BlockType.COIN){
          player.maxJumps++
          stage.scene.remove(block.body)
          blocks.splice(i, 1);
        }else if(block.type == BlockType.ENEMY1){
          //TODO this logic is also above for reg collision
          var overlap = collision.max.clone().sub(collision.min)
          var axis = ""
          //find which axis to handle the collision
          if(overlap.x != 0 && overlap.x <= overlap.y && overlap.x <= overlap.z){
            axis = "x"
          }else if(overlap.y != 0 && overlap.y <= overlap.x && overlap.y <= overlap.z){
            axis = "y"
          }else if(overlap.z != 0 && overlap.z <= overlap.y && overlap.z <= overlap.x){
            axis = "z"
          }
          //determine which side of the axis the collision occured
          var posDirAdj = collision.max[axis] != player.collider.max[axis]
          if(axis == "y" && posDirAdj){
            stage.scene.remove(block.body)
            blocks.splice(i, 1);
            player.spd.y = 0.02
          }else{
            player.reset()
          }
        }
      }
    })

    controllerDrag.update();
		controllerPlace.update();

    if(controllerDrag.getButtonPressedState("thumbpad") == "down"){
      console.log("play game")
    }

    //rotate origin when controllerDrag is pressed
    if(controllerDrag.getButtonPressedState("trigger") == "down"){
      THREE.SceneUtils.attach(originMesh, stage.scene, controllerDrag)
    }else if(controllerDrag.getButtonPressedState("trigger") == "up"){
			THREE.SceneUtils.detach(originMesh, controllerDrag, stage.scene)
    }

    if(controllerPlace.getButtonPressedState("thumbpad") == "down"){
      console.log("press")
      brickCreator.nextType()
    }

    //create cube
    if(controllerPlace.getButtonPressedState("trigger") == "down"){
      lastKey = ""
    }
    if(controllerPlace.getButtonState("trigger")){
      var sizeOfCube = 1;
      var local = originMesh.worldToLocal(brickCreator.body.getWorldPosition().clone()).addScalar(sizeOfCube/2)
      var gridPos = local.clone().divideScalar(sizeOfCube).floor()


      var key = gridPos.x+","+gridPos.y+","+gridPos.z
      if(key != lastKey){
        if(creation.cubes[key]){
          var old = creation.cubes[key]
          originMesh.remove(old.body)
          delete creation.cubes[key]
        }else{
          var block = new Block(brickCreator.typeOfBlock, sizeOfCube, gridPos)
          originMesh.add(block.body)
          block.body.position.copy(gridPos.clone().multiplyScalar(sizeOfCube))
          block.update()
          creation.cubes[key] = block
        }
        lastKey = key
      }
    }

    if(controllerPlace.getButtonPressedState("menu") == "down"){
      console.log("hit")
      for(var key in creation.cubes){
        console.log("key")
        originMesh.remove(creation.cubes[key].body)
        delete creation.cubes[key]
      }
    }

    if(controllerDrag.getButtonPressedState("menu") == "down"){
      var dl = (filename, text)=>{
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
      console.log("clicked menu");
      // var exporter = new OBJExporter();
      // var parsed = exporter.parse(originMesh);
      // console.log(parsed)
      // dl('test.obj', parsed)
      var json = {objects:[]}
      for(var key in creation.cubes){
        json.objects.push(creation.cubes[key].getJson())
      }

      dl('level.json', JSON.stringify(json))
    }
  })
}
$(document).ready(()=>{
  main()
})
