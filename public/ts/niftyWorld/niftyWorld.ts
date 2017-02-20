import $ = require("jquery")
import Vue = require("vue");

import Stage from "../../../libs/niftyWorld/objects/stage";
import Controller from "../../../libs/niftyWorld/objects/controller";
import Character from "../../../libs/niftyWorld/objects/character"
import Block from "../../../libs/niftyWorld/objects/block"
import MATERIALS from "../../../libs/niftyWorld/libs/materials"
import request = require("request")
import THREE = require("three")

var main = async ()=>{
  var container = document.getElementById('container')
  var stage = Stage.create(container)

  //lighting
  var ambiant = new THREE.AmbientLight(0xFFFFFF, 0.1);
  stage.scene.add(ambiant);

  var point1 = new THREE.PointLight(0xFFFFFF, 0.1)
  point1.position.y += 3
  point1.position.z += 3
  stage.scene.add(point1);

  var point2 = new THREE.PointLight(0xFFFFFF, 0.1)
  point2.position.y += 0
  point2.position.x += 2
  stage.scene.add(point2);

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
	})
	var player = new Character(controller);
  stage.scene.add(player.body)

  function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  var level = getParameterByName('level') || '0'
  var resp = await $.get("/public/levels/"+level+".json")

  //walls
  var blocks: Block[] = []
  var bSize = 3;
  resp.objects.forEach((c)=>{

    var newB = new Block(bSize,bSize,bSize)
    newB.body.position.x = c.gridPos.x * bSize
    newB.body.position.y = c.gridPos.y * bSize
    newB.body.position.z = c.gridPos.z * bSize
    newB.gridPos = new THREE.Vector3(Math.round(c.gridPos.x), Math.round(c.gridPos.y), Math.round(c.gridPos.z))
    newB.update()
    stage.scene.add(newB.body)
    blocks.push(newB)
  })


  //main loop
  stage.startRender((delta, time)=>{

    player.update(delta)

    //Handle collisions
    var axisDone = []
    blocks.forEach((block, i)=>{
      var collision = player.collider.clone().intersect(block.collider)
      if(!collision.isEmpty()){
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

        if(axis!="" && axisDone.indexOf(axis) == -1){
          //determine which side of the axis the collision occured
          var posDirAdj = collision.max[axis] != player.collider.max[axis]

          //handle aabb adjacent block issue by not handling physics for adjacent walls
          var nextBlock = blocks.filter((b)=>{
            return block.gridPos.x == (b.gridPos.x + (axis == 'x' ? (posDirAdj ? -1 : 1) : 0)) && block.gridPos.y == (b.gridPos.y + (axis == 'y' ? (posDirAdj ? -1 : 1) : 0)) && block.gridPos.z == (b.gridPos.z + (axis == 'z' ? (posDirAdj ? -1 : 1) : 0))
          })[0]
          if(!nextBlock){
            //only do collision once per axis per frame
            //TODO avoid this by updating aabb so collision wont occur multiple times
            axisDone.push(axis)

            //collision adjustment
            player.body.position[axis] += (posDirAdj ? overlap[axis] : -overlap[axis])
            if(player.spd[axis] <= 0 && posDirAdj){
              player.spd[axis]=0;
            }else if(player.spd[axis] > 0 && !posDirAdj){
              player.spd[axis]=0;
            }

            //apply friction when touching ground
            if(axis == "y"){
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
          }
        }
      }
    })

    //update camera
    stage.camera.position.copy(player.getCameraPos())
		stage.camera.lookAt(player.getCameraLook())
  })
}
$(document).ready(()=>{
  main()
})
