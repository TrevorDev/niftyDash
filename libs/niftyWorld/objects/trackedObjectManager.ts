import THREE = require("three")
import Stage from "../../../libs/niftyWorld/objects/stage"
import MATERIALS from "../../../libs/niftyWorld/libs/materials"

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

class TrackedObjectManager {
  io:SocketIOClient.Socket
  trackedObjects:TrackedObject[] = []
  stage:Stage
  lastUpdate = 0
  updateInterval = 100
  constructor(io, stage){    
    this.stage = stage
    this.io = io
    this.io.on("updateObject", (obj)=>{
      // console.log("updatefromserver")
      // console.log(obj)
      //console.log(obj)
      this.trackedObjects[obj.guid].update(obj)
    })
    this.io.on("addObject", (obj)=>{
      console.log("add")
      var newObj = new TrackedObject(obj)
      this.stage.scene.add(newObj.mesh)
      this.trackedObjects[newObj.guid] = newObj
    })
    this.io.on("removeObject", (obj)=>{
      console.log("remove")
      this.stage.scene.remove(this.trackedObjects[obj.guid].mesh)
      delete this.trackedObjects[obj.guid]
    })
  }
  createObject(type){
    // console.log("ID HERE:")
    // console.log(this.io.id)
    var obj = new TrackedObject({type: type, owner: this.io.id})
    this.stage.scene.add(obj.mesh)
    this.io.emit("addObject", obj.createInfo())
    this.trackedObjects[obj.guid] = obj
    return obj
  }
  update(curTime){
    if(curTime - this.lastUpdate > this.updateInterval){
      this.lastUpdate = curTime
      //console.log("tracked obj updated")
      for(var key in this.trackedObjects){
        var obj = this.trackedObjects[key]
        
        if(obj.owner == this.io.id){
          //console.log(obj.owner)
          this.io.emit("updateObject", obj.createInfo())
        }
      }
    }
  }
}

class TrackedObject {
  type:string = ""
  mesh:THREE.Mesh
  guid:string
  owner:string //socketID or server
  constructor(args){
    this.type = args.type
    this.guid = args.guid ? args.guid : guid()
    this.owner = args.owner
    if(this.type == "box"){
      var geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      this.mesh = new THREE.Mesh( geo, MATERIALS.DEFAULT );
    }else if(this.type == "head"){
      let geo = new THREE.SphereGeometry(0.3, 32,16);
      this.mesh = new THREE.Mesh( geo, MATERIALS.SMILE_FACE_MOUTH_OPEN )
    }else if(this.type == "controller"){
      let geo = new THREE.SphereGeometry(0.1, 10,10);
      this.mesh = new THREE.Mesh( geo, MATERIALS.SMILE_FACE_MOUTH_OPEN )
    }
    this.update(args)
  }
  update(obj){
    if(obj.pos){
      this.mesh.position.set(obj.pos.x, obj.pos.y, obj.pos.z)
    }
    if(obj.ori){
      this.mesh.quaternion.set(obj.ori._x,obj.ori._y,obj.ori._z,obj.ori._w)
    }
    
    //this.mesh.quaternion =
  }
  createInfo(){
    return {
      owner: this.owner,
      type: this.type,
      guid: this.guid,
      pos: this.mesh.position,
      ori: this.mesh.quaternion,
      spd: new THREE.Vector3(0,0,0)
    }
  }
}

export default TrackedObjectManager