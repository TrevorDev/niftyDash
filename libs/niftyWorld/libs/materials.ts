import THREE = require("three")

var globalUniforms = {
  time: { value: 0 },
  inverseCameraView: { value: [] }
}

//http://stackoverflow.com/questions/35596705/using-lights-in-three-js-shader
var defaultUniforms = THREE.UniformsUtils.merge( [

    THREE.UniformsLib[ "ambient" ],
    THREE.UniformsLib[ "lights" ]
] );
defaultUniforms.time = globalUniforms.time
defaultUniforms.inverseCameraView = globalUniforms.inverseCameraView

export default {
  update: function(delta){
    globalUniforms.time.value += delta
    //console.log(globalUniforms.time.value)
  },
  DEFAULT: new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture('/public/img/cubeFace.png')
		//metalness: 0.0
	}),
  BLOCK: new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/public/img/cubeFace.png')
  }),
  GOAL: new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/public/img/cubeFace.png'),
    color: 0x33CC33
  }),
  DEATH: new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/public/img/cubeFace.png'),
    color: 0x222222
  }),
  ENEMY1: new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/public/img/cubeFace.png'),
    color: 0x777777
  }),
  COIN: new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('/public/img/cubeFace.png'),
    color: 0xffff00
  }),
  SAND: new THREE.MeshPhongMaterial({
		color: 0xfff6ad,
		//metalness: 0.0
	}),
  LEAF: new THREE.MeshStandardMaterial({
		color: 0x1b4917,
		metalness: 0.2
	}),
  MOON: new THREE.ShaderMaterial( {
    lights: true,
  	uniforms: defaultUniforms,
  	vertexShader: `
      void main() {
        //regular vertex shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
  	fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.9,0.9,0.9, 1.0);
      }`
  }),
  BLINK: new THREE.ShaderMaterial( {
    lights: true,
  	uniforms: defaultUniforms,
  	vertexShader: `
      void main() {
        //regular vertex shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
  	fragmentShader: `
      uniform float time;
      uniform vec3 pointLightPosition[ 1 ];
      void main() {
        float g = (sin(time/1000.0) + 1.0) / 2.0;
        gl_FragColor = vec4(g, g, 0.0, 1.0);
      }`
  }),
  SKY: new THREE.ShaderMaterial( {
    lights: true,
  	uniforms: defaultUniforms,
    side: THREE.BackSide,
  	vertexShader: `
      varying vec3 vPositionInWorld;
      void main() {
        vPositionInWorld = vec3(modelMatrix * vec4(position, 1.0));
        //regular vertex shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
  	fragmentShader: `
      varying vec3 vPositionInWorld;
      void main() {
        vec3 up = vec3(0.0, 1.0, 0.0);
        float zenithAngle = acos(max(0.0, dot(up, normalize(vPositionInWorld - vec3(0,0,0)))));
        float darkenes = 0.5;
        gl_FragColor = vec4(zenithAngle*0.1*darkenes,zenithAngle*0.3*darkenes, zenithAngle*0.5*darkenes, 1.0);
      }`
  }),
  WATER: new THREE.ShaderMaterial( {
    lights: true,
    blending: THREE.NormalBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  	uniforms: defaultUniforms,
  	vertexShader: `
    	varying vec3 vPositionInWorld;
    	varying vec3 vNormalInWorld;
      varying vec3 vRandNormalInWorld;
      uniform float time;
      void main() {
        //somewhat random wave function
        float wave = sin((time/1000.0)+position.y+sin(position.y*1000.0+position.x*1000.0+103.432*10294.0));

        //position and normal without projectionMatrix
    		vPositionInWorld = vec3(modelMatrix * vec4(position, 1.0));
        vPositionInWorld.y+=wave*1.0;
        vNormalInWorld = normalize(vec3(modelMatrix * vec4(normal, 1.0)));

        // vRandNormalInWorld = normalize(vec3(modelMatrix * vec4(normal, 1.0)));
        // vRandNormalInWorld.x += wave*0.4+2.0;
        // vRandNormalInWorld.z += wave*0.4;
        float a = ((wave + 1.0) / 2.0)*0.8;
        vRandNormalInWorld = normalize(vec3(0.0,a, 1.0-a));


        //regular vertex shader
        gl_Position = projectionMatrix * viewMatrix * vec4( vPositionInWorld, 1.0 );
      }`,
  	fragmentShader: `
      varying vec3 vPositionInWorld;
      varying vec3 vNormalInWorld;
      varying vec3 vRandNormalInWorld;
      uniform float time;
      uniform mat4 inverseCameraView;

      struct PointLight {
        vec3 position;
        vec3 color;
      };
      uniform PointLight pointLights[ 1 ];

      void main() {
        //Need to map from worldview to world because lights are in world view for some reason
        vec3 lightPositionInWorld = vec3(inverseCameraView * vec4(pointLights[0].position, 1));
        //vector from light to pixel
        vec3 lightVectorW = normalize(lightPositionInWorld - vPositionInWorld);
        //angle between normal and pixel
        float andleBetweenLightAndPlane = max(0., dot(vNormalInWorld, lightVectorW));
        float andleBetweenDownAndPlane = max(0., dot(vRandNormalInWorld, vec3(0,1,0))) * 0.7;
        float colorVal = (andleBetweenDownAndPlane*0.2 + andleBetweenLightAndPlane*0.8);
        gl_FragColor = vec4(colorVal*0.5, colorVal, 0.8, 0.7);
      }`
  }),
  GROUND: new THREE.MeshLambertMaterial({
    map: (()=>{
      var text = THREE.ImageUtils.loadTexture('/public/img/checkerboard.png', null, function ( texture ) {

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          //texture.offset.set( 0, 0 );
          texture.repeat.set( 10, 10 );

      })
      return text
    })()
    //metalness: 0.0
  }),
}
