import THREE = require("three")

class App {
  constructor(public name:string, public link:string){
  }
}


class AppInstance {
  public stage:THREE.Object3D
}

export default App
