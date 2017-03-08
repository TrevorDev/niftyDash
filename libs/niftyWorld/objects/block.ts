import THREE = require("three")
import materials from "../libs/materials"
import BlockType from "../objects/blockType"
import Box3Helper from "../libs/box3Helper"

class Block {
  body:THREE.Mesh
  gridPos:THREE.Vector3 = new THREE.Vector3(0,0,0)
  collider:THREE.Box3 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
  type:BlockType

  constructor(type, size, gridPos:THREE.Vector3){
    this.gridPos = gridPos
    this.type = type
    this.body = new THREE.Mesh(new THREE.BoxGeometry(size,size,size), materials[BlockType[type]]);
    this.body.position.x = gridPos.x * size
    this.body.position.y = gridPos.y * size
    this.body.position.z = gridPos.z * size
    this.update()
  }

  update(){
    this.collider = Box3Helper.createFromObject(this.body)
  }

  getJson(){
    return {type: this.type, gridPos: this.gridPos}
  }
}

export default Block
