import $ = require("jquery")
import Vue = require("vue");
//TODO use better three imporrts
import THREE = require("three")
import Stage from "../../../libs/niftyWorld/objects/stage"
import sceneObjectCreator from "../../../libs/niftyWorld/libs/sceneObjectCreator"
import TrackedObjectManager from "../../../libs/niftyWorld/objects/trackedObjectManager"
import socketClient = require('socket.io-client')
import ViveController from "../../../libs/niftyWorld/threeExtensions/ViveController"


var clonePosOri = (src, dest)=>{
	dest.position.copy(src.position)
	dest.quaternion.copy(src.quaternion)
}

var getAudioStream = async ()=>{
	return new Promise((res, rej)=>{
		navigator.getUserMedia({audio:true}, (stream)=>{
			res(stream)
		},()=>{rej("cant find media")});
	})
}

function convertFloat32ToInt16(buffer) {
     var l = buffer.length;
     var buf = new Int16Array(l);
     while (l--) {
       buf[l] = Math.min(1, buffer[l])*0x7FFF;
     }
     return buf.buffer;
}



var main = async ()=>{

	var peerConnection

	// var audioStream = await getAudioStream()


	// function start(isCaller) {
	// 	var args = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]}
	//     peerConnection = new RTCPeerConnection(args);
	//     peerConnection.onicecandidate = (event)=>{
	//     	//event.candidate should be sent to other client
	//     }
	//     peerConnection.onaddstream = (event)=>{
	//     	//remoteVideo.src = window.URL.createObjectURL(event.stream);
	//     }
	//     peerConnection.addStream(localStream);

	//     if(isCaller) {
	//         peerConnection.createOffer(gotDescription, createOfferError);
	//     }
	// }

	// function gotDescription(description) {
	//     console.log('got description');
	//     peerConnection.setLocalDescription(description, function () {
	//         serverConnection.send(JSON.stringify({'sdp': description}));
	//     }, function() {console.log('set description error')});
	// }

	// function createOfferError(error) {
	//     console.log(error);
	// }









	var container = document.getElementById('container')
	var stage = Stage.create(container, {enableVR: true})

	//Tracked object handler
	var io = socketClient();
	var tManager = new TrackedObjectManager(io, stage)
	var prom = new Promise((res, rej)=>{
		io.on("connect", ()=>{
			console.log("conn!")
			res()})
	})
	await prom

	var audioContext = new AudioContext();
	var audioBufferSize = 2048*2;
	if(window.location.search.indexOf("audio") != -1){
		var audioStream = await navigator.mediaDevices.getUserMedia({audio:true});
		var mediaStreamSource = audioContext.createMediaStreamSource(audioStream);
		
		var recorder = audioContext.createScriptProcessor(audioBufferSize, 1, 1)
		recorder.onaudioprocess = (e)=>{

			//console.log("audioframne")
			var left = e.inputBuffer.getChannelData(0);
	        io.emit('audioBuffer', {buffer: left.buffer});
	        //console.log(new Float32Array(left.buffer))
	        var ar = new Float32Array(left.buffer)
	        var max = 0
	        for(var i = 0; i<audioBufferSize;i++){
	        	max = Math.max(max, Math.abs(ar[i]))
	        }
	        if(max > 0.1){
	        	console.log("open mouth")
	        }
		}
		mediaStreamSource.connect(recorder)
		recorder.connect(audioContext.destination);
	}
	

	var buffered = []
	var count = 0
	io.on('audioBuffer',function(buffer) {
		buffered.push(buffer)
		count++;
		if(count == 1){
			console.log("hit")
			var processor = audioContext.createScriptProcessor(audioBufferSize, 0, 1);
			processor.onaudioprocess = function(e) {
				var buffer = buffered.pop()
				if(buffer){
					var array = new Float32Array(buffer.buffer)
					e.outputBuffer.getChannelData(0).set(array)
				}else{
					console.log("processed b4 audio arrived :(")
					var array = new Float32Array(audioBufferSize)
					e.outputBuffer.getChannelData(0).set(array)
				}
			}
			processor.connect(audioContext.destination);
		}
    });

	//controllers
	var controllers = {
		left: new ViveController( 0 ),
		right: new ViveController( 1 )
	}
	for(var key in controllers){
		controllers[key].update()
		controllers[key].standingMatrix = stage.VRControls.getStandingMatrix()
		stage.scene.add( controllers[key] );
	}
	//controllers.left.add(leftHand.mesh)

	//create objects
	var box = tManager.createObject("box")
	var head = tManager.createObject("head")
	var leftHand = null
	var rightHand = null
	if(controllers.left.position.z != 0 ){
		leftHand = tManager.createObject("leftController")
		rightHand = tManager.createObject("rightController")
	}

	//default scene
	var lights = sceneObjectCreator.createLights(stage)
	sceneObjectCreator.createSkybox(stage)

	sceneObjectCreator.createIsland(stage)
	sceneObjectCreator.createLand(stage)

	stage.startRender((delta, time)=>{
		for(var key in controllers){
			controllers[key].update()
		}
		clonePosOri(stage.camera, head.mesh)
		//this is dumb
		if(leftHand){
			clonePosOri({position: (new THREE.Vector3()).applyMatrix4(controllers.left.matrix), quaternion: (new THREE.Quaternion()).setFromRotationMatrix(controllers.left.matrix)}, leftHand.mesh)
			clonePosOri({position: (new THREE.Vector3()).applyMatrix4(controllers.right.matrix), quaternion: (new THREE.Quaternion()).setFromRotationMatrix(controllers.right.matrix)}, rightHand.mesh)
		}
		
		//console.log()\

		//console.log(controllers.left.position)
		box.mesh.position.x += delta/800
		tManager.update(time)
	})
}

main();