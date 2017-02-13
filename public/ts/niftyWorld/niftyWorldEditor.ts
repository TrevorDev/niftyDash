//require("babel-polyfill");

import $ = require("jquery")
import Vue = require("vue");

import Stage from "../../../libs/niftyWorld/objects/stage";
import GridObject from "../../../libs/niftyWorld/objects/gridObject";
import MATERIALS from "../../../libs/niftyWorld/libs/materials"
import OBJLoader from "../../../libs/niftyWorld/threeExtensions/OBJLoader"
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
  var originGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
  var originMesh = new THREE.Mesh( originGeo, MATERIALS.DEFAULT )
  stage.scene.add( originMesh );
  var creation = {
    cubes: {}
  }
  var lastKey = ""

  //controllers
  var controller1 = new ViveController( 0 );
  controller1.standingMatrix = stage.VRControls.getStandingMatrix();
  stage.scene.add( controller1 );
  var controller2 = new ViveController( 1 );
  controller2.standingMatrix = stage.VRControls.getStandingMatrix();
  stage.scene.add( controller2 );
  var loader = new OBJLoader(undefined);
	loader.setPath( '/public/models/' );
  var realCont:any
	loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {
		var loader = new THREE.TextureLoader();
		loader.setPath( '/public/models/' );
		var controller = object.children[ 0 ];
		controller.material.map = loader.load( 'onepointfive_texture.png' );
		controller.material.specularMap = loader.load( 'onepointfive_spec.png' );
		controller1.add( object.clone() );
    realCont = object.clone()
		controller2.add( realCont );
	} );
  var tipGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
  var tipMesh = new THREE.Mesh( tipGeo, MATERIALS.DEFAULT )
  tipMesh.position.z = -0.3
  controller2.add(tipMesh)
  //FOR DEBUGGING, auto start vr
  setTimeout(()=>{stage.VREffect.requestPresent()},100)

  //main loop
  stage.startRender((delta, time)=>{
    controller1.update();
		controller2.update();

    //rotate origin when controller1 is pressed
    if(controller1.getButtonPressedState("trigger") == "down"){
      THREE.SceneUtils.attach(originMesh, stage.scene, controller1)
    }else if(controller1.getButtonPressedState("trigger") == "up"){
			THREE.SceneUtils.detach(originMesh, controller1, stage.scene)
    }

    //create cube
    if(controller2.getButtonPressedState("trigger") == "down"){
      lastKey = ""
    }
    if(controller2.getButtonState("trigger")){
      var sizeOfCube = 0.05;
      var controllerPosRelativeToOriginMesh:THREE.Vector3 = tipMesh.getWorldPosition().sub(originMesh.getWorldPosition());

      //get axis of originMesh
      var matrix = new THREE.Matrix4();
      matrix.extractRotation( originMesh.matrixWorld );
      var forward = (new THREE.Vector3( 0, 0, 1 )).applyMatrix4(matrix)
      var right = (new THREE.Vector3( 1, 0, 0 )).applyMatrix4(matrix)
      var up = (new THREE.Vector3( 0, 1, 0 )).applyMatrix4(matrix)

      var newPos = new THREE.Vector3(
        Math.floor( // devide by sizeOfCube, floor and multiply by sizeOfCube to position on grid
            (
                controllerPosRelativeToOriginMesh.dot(right) // get vector on the x axis
                + (sizeOfCube / 2) // add half the sizeOfCube to make point relative to corner of cube
            ) / sizeOfCube
        ) * sizeOfCube,
        //do same as above for other vectors
        Math.floor((controllerPosRelativeToOriginMesh.dot(up) + (sizeOfCube / 2)) / sizeOfCube) * sizeOfCube,
        Math.floor((controllerPosRelativeToOriginMesh.dot(forward) + (sizeOfCube / 2)) / sizeOfCube) * sizeOfCube
      );

      var key = newPos.x+","+newPos.y+","+newPos.z
      if(key != lastKey){
        if(creation.cubes[key]){
          var old = creation.cubes[key]
          originMesh.remove(old.mesh)
          delete creation.cubes[key]
        }else{
          var newGeo = new THREE.BoxGeometry( sizeOfCube, sizeOfCube, sizeOfCube );
          var newMesh = new THREE.Mesh( newGeo, MATERIALS.DEFAULT )
          var added = right.multiplyScalar(newPos.x).add(up.multiplyScalar(newPos.y)).add(forward.multiplyScalar(newPos.z))
          newMesh.position.copy(originMesh.getWorldPosition().clone().add(added))
          newMesh.rotation.setFromRotationMatrix(originMesh.matrixWorld)
          //update matrixworld required when attaching to another object after modifying newmesh.pos/rot as they dont update newmesh.matrixWorld
          newMesh.updateMatrixWorld(true);

          THREE.SceneUtils.attach(newMesh, stage.scene, originMesh)
          creation.cubes[key] = new GridObject(newMesh, newPos.clone().divideScalar(sizeOfCube), "block")
        }
        lastKey = key
      }
    }

    if(controller2.getButtonPressedState("menu") == "down"){
      for(var key in creation.cubes){
        originMesh.remove(creation.cubes[key].mesh)
        delete creation.cubes[key]
      }
    }

    if(controller1.getButtonPressedState("menu") == "down"){
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
