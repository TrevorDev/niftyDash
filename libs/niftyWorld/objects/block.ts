import THREE = require("three")
import materials from "../libs/materials"
import Controller from "../objects/controller"

class Block {
  body:THREE.Mesh
  view:THREE.Vector3 = new THREE.Vector3(0,0,0)
  collider:THREE.Box3 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())

  constructor(x, y, z){
    this.body = new THREE.Mesh(new THREE.BoxGeometry(x,y,z), materials.DEFAULT);
    this.update();
  }

  update(){
    this.collider.setFromObject(this.body)
  }
}

export default Block
