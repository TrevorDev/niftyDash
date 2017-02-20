import THREE = require("three")

import WEBVR from "../threeExtensions/WebVR"
import VREffect from "../threeExtensions/VREffect"
import VRControls from "../threeExtensions/VRControls"

class Stage {
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  renderer:THREE.WebGLRenderer;
  enableVR:boolean;
  VREffect:any;
  VRControls:any;
  constructor(options?){
    if(options && options.enableVR){
      this.enableVR = true
    }else{
      this.enableVR = false
    }
  }

  startRender(renderLoop){
    var frameCount = 0
    var render = ()=>{
      //TODO, may want to add composer
      if(this.enableVR){
        this.VREffect.render( this.scene, this.camera );
      }else{
        this.renderer.render( this.scene, this.camera )
      }
      frameCount++
    }
    var fpsCount = ()=>{
      console.log(frameCount)
      frameCount = 0
      setTimeout(fpsCount, 1000)
    }
    fpsCount()


    var last = Date.now()
    var curTime = 0
    var animate = ()=>{
      if(this.enableVR){
        this.VREffect.requestAnimationFrame( animate )
        this.VRControls.update();
      }else{
        window.requestAnimationFrame(animate);
      }
      var now = Date.now()
      var delta = now - last
      last = now
      curTime += delta

      //TODO why does startup have large de
      if(delta > 100){
        delta = 0
      }
      renderLoop(delta, curTime)
			render();
    }
    animate()
  }

  static create(container, options?){
    var ret = new Stage(options);
    ret.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3500000 );
  	ret.camera.position.z = 100;

    ret.scene = new THREE.Scene();
  	ret.scene.background = new THREE.Color( 0x808080 );

    ret.renderer = new THREE.WebGLRenderer( { antialias: true } );
    ret.renderer.setPixelRatio( window.devicePixelRatio );
		ret.renderer.setSize( window.innerWidth, window.innerHeight );
		ret.renderer.shadowMap.enabled = true;
		ret.renderer.gammaInput = true;
		ret.renderer.gammaOutput = true;


    if(ret.enableVR){
      //VR
      ret.VREffect = new VREffect( ret.renderer, ()=>{console.log("vr error")} );
      if ( WEBVR.isAvailable() === true ) {
        document.body.appendChild( WEBVR.getButton( ret.VREffect ) );
      }

      ret.VRControls = new VRControls( ret.camera , ()=>{console.log("control err")});
      ret.VRControls.standing = true;
    }
    container.appendChild( ret.renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {

    	ret.camera.aspect = window.innerWidth / window.innerHeight;
    	ret.camera.updateProjectionMatrix();

    	ret.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    return ret;
  }

}

export default Stage
