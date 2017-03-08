import BlockType from "../../../libs/niftyWorld/objects/blockType"
import Block from "../../../libs/niftyWorld/objects/block";
import THREE = require("three")
var lastKey = ""

export default {
	runObjects: (delta, stage, player, creation)=>{
		//handle collisions
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
	      //block.update() //TODO this shouldnt be needed
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
	                player.body.position[axis] += (posDirAdj ? overlap[axis] : -overlap[axis])
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
	},
	runDragController: (controller, stage, originMesh, creation)=>{
		controller.update();

	    if(controller.getButtonPressedState("thumbpad") == "down"){
	      console.log("play game")
	    }

	    //rotate origin when controller is pressed
	    if(controller.getButtonPressedState("trigger") == "down"){
	      THREE.SceneUtils.attach(originMesh, stage.scene, controller)
	    }else if(controller.getButtonPressedState("trigger") == "up"){
				THREE.SceneUtils.detach(originMesh, controller, stage.scene)
	    }

	    if(controller.getButtonPressedState("menu") == "down"){
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
	},
	runPlaceController: (controller, stage, originMesh, brickCreator, creation)=>{
		controller.update();
	    if(controller.getButtonPressedState("thumbpad") == "down"){
	      console.log("press")
	      brickCreator.nextType()
	    }

	    //create cube
	    if(controller.getButtonPressedState("trigger") == "down"){
	      lastKey = ""
	    }
	    if(controller.getButtonState("trigger")){
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

	    if(controller.getButtonPressedState("menu") == "down"){
	      console.log("hit")
	      for(var key in creation.cubes){
	        console.log("key")
	        originMesh.remove(creation.cubes[key].body)
	        delete creation.cubes[key]
	      }
	    }
	}
}