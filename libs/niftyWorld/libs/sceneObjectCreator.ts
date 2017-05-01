import MATERIALS from "../../../libs/niftyWorld/libs/materials"
import ViveController from "../../../libs/niftyWorld/threeExtensions/ViveController"
import OBJLoader from "../../../libs/niftyWorld/threeExtensions/OBJLoader"
import Character from "../../../libs/niftyWorld/objects/character";
import Controller from "../../../libs/niftyWorld/objects/controller";
import THREE = require("three")
import html2canvas = require("html2canvas")

export default {
	createLights: (stage)=>{
		var lights = {
			ambiant: new THREE.AmbientLight(0xFFFFFF, 0.1),
			point1: new THREE.PointLight(),
			point2: new THREE.PointLight()
		}
		stage.scene.add(lights.ambiant);

		lights.point1.position.y += 3
		lights.point1.position.z += 3
		stage.scene.add(lights.point1);

		lights.point2.position.y += 0
		lights.point2.position.x += 2
		stage.scene.add(lights.point2);

		return lights
	},
	createSkybox: (stage)=>{
		var skyGeo = new THREE.SphereBufferGeometry( 450000, 32, 15 );
		var skyMesh = new THREE.Mesh( skyGeo, MATERIALS.SKY );
		stage.scene.add( skyMesh );
		return skyMesh
	},
	createVideo: (stage, video)=>{
		var texture = new THREE.VideoTexture( video );
		texture.minFilter = THREE.NearestFilter;
		texture.maxFilter = THREE.NearestFilter;
		texture.format = THREE.RGBFormat;
		texture.generateMipmaps = false;
		var geo = new THREE.PlaneGeometry(10,10)
		var material = new THREE.MeshBasicMaterial( { map: texture } );
		var mesh = new THREE.Mesh(geo, material)
		stage.scene.add( mesh )
		return mesh
	},
	createIsland: (stage)=>{
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

		var thingGeo = new THREE.BoxGeometry( 2, 2, 1 );
		var thingMesh = new THREE.Mesh( thingGeo, MATERIALS.DEFAULT )
		thingMesh.position.set(0,2, 2);

		leafMesh.position.y = 3
		treeMesh.add(leafMesh)
		island.add(treeMesh)
		island.add(islandGround)
		island.add(thingMesh)
		island.position.y = -5;
		island.position.z = -10;
		island.position.x = 20;
		stage.scene.add( island );
		return island
	},
	createLand: (stage)=>{
		var obj = new THREE.Object3D()

		var groundGeo = new THREE.PlaneGeometry(50,50)
		var ground = new THREE.Mesh(groundGeo, MATERIALS.GROUND )
		ground.rotateX(-Math.PI/2);
		ground.position.y -= 0;

		obj.add(ground)

		stage.scene.add( obj );
		return obj
	},
	createPlayer: (stage):Character =>{
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
		// THREE.SceneUtils.attach(originMesh, stage.scene, controllers.controllerDrag)
		return player
	},
	createOrigin: (stage)=>{
		var originGeo = new THREE.BoxGeometry( 1, 1, 1 );
		var originMesh = new THREE.Mesh( originGeo, MATERIALS.DEFAULT )
		originMesh.position.set(-1.5,1,0)
		var originMeshScale = 0.03
		originMesh.scale.set(originMeshScale,originMeshScale,originMeshScale)
		stage.scene.add( originMesh );
		return originMesh
	},
	createControllers: (stage)=>{
		var left = new ViveController( 0 );
		left.standingMatrix = stage.VRControls.getStandingMatrix();
		stage.scene.add( left );
		var right = new ViveController( 1 );
		right.standingMatrix = stage.VRControls.getStandingMatrix();
		stage.scene.add( right );
		var loader = new OBJLoader(undefined);
		loader.setPath( '/public/models/' );
		var realCont:any
		loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {
			var loader = new THREE.TextureLoader();
			loader.setPath( '/public/models/' );
			var controller = object.children[ 0 ];
			controller.material.map = loader.load( 'onepointfive_texture.png' );
			controller.material.specularMap = loader.load( 'onepointfive_spec.png' );
			left.add( object.clone() );
			realCont = object.clone()
			right.add( realCont );
		});
		return {
			left: left,
			right: right
		}
	},

	htmlViewer: (stage, element)=>{
		


	    html2canvas(element).then(function(canvas) {
        	//document.body.appendChild(canvas);
        	var geo = new THREE.PlaneGeometry(10,10)
			var mat = new THREE.MeshLambertMaterial()

        	var texture = new THREE.CanvasTexture(canvas);
			texture.minFilter = THREE.LinearFilter
			mat.map = texture


			
			var mesh = new THREE.Mesh(geo, mat)

			stage.scene.add( mesh )
			mesh.position.z -= 8
	    });
	}

	// ,
	// createPlayer: (stage)=>{
		
	// },
	// createPlayer: (stage)=>{
		
	// }
}