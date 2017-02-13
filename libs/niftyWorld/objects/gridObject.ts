import THREE = require("three")
import materials from "../libs/materials"
import Controller from "../objects/controller"

class GridObject {
  mesh:THREE.Mesh
  type:string
  gridPos:THREE.Vector3

  constructor(m:THREE.Mesh, pos, type){
    this.mesh = m;
    this.gridPos = pos
    this.type=type
  }

  getJson(){
    return {type: this.type, gridPos: this.gridPos}
  }
}

export default GridObject
