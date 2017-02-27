import THREE = require("three")
import MATERIALS from "../libs/materials"
import Block from "../objects/block"
import BlockType from "../objects/blockType"

class BlockCreator {
  body:THREE.Mesh
  typeOfBlock:BlockType = BlockType.BLOCK
  constructor(){
    var tipGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
    this.body = new THREE.Mesh( tipGeo, MATERIALS.BLOCK )
    this.body.position.z = -0.3
  }

  nextType(){
    var num = this.typeOfBlock+1
    if(!BlockType[num]){
      num = 0
    }
    this.typeOfBlock = num
    var met = MATERIALS[BlockType[this.typeOfBlock]]
    if(!met){
      met = MATERIALS.BLOCK
    }
    this.body.material = met
  }


}

export default BlockCreator
