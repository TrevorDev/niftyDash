class Mapping {
  constructor(public input, public mapping, public pressed:boolean, public value){

  }
}

class Controller {
  input = {};
  mapping = {};
  gamepad:any = {}
  constructor(controls, gamepad){
    this.gamepad = gamepad
    for(var key in controls){
      var m = new Mapping(controls[key].toLowerCase(), key.toLowerCase(), false, 0);
      this.input[controls[key]] = m;
      this.mapping[key] = m;
    }

    var setterFunc = (bool)=>{
      return ( e ) => {
          var hit =  convertToKey(e.keyCode)
          for(var key in this.input){
            if(key == hit){
              this.input[key].pressed = bool;
              break;
            }
          }
      }
    }

    document.addEventListener('keyup', setterFunc(false));
    document.addEventListener('keypress', setterFunc(true));

    //handle mouse input
    document.addEventListener( 'mousemove', (event:any)=>{
      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      for(var key in this.input){
        //TODO fix the issue where savedKey var name needs to be different
        if(key == "mouseX"){
          var savedKey = key
          this.input[savedKey].value = -movementX;
          //TODO use static typing for customTImeout
          if(this.input[savedKey].customTimeout){
            clearTimeout(this.input[savedKey].customTimeout);
          }
          this.input[savedKey].customTimeout = setTimeout(()=>{this.input[savedKey].value = 0}, 10);
        }
        if(key == "mouseY"){
          var savedKey2 = key
          this.input[savedKey2].value = -movementY;
          //TODO use static typing for customTImeout
          if(this.input[savedKey2].customTimeout){
            clearTimeout(this.input[savedKey2].customTimeout);
          }
          this.input[savedKey2].customTimeout = setTimeout(()=>{this.input[savedKey2].value = 0}, 10);
        }
      }
    }, false );
    var canvas:any = document.querySelector('canvas');
    canvas.onclick = function() {
      canvas.requestPointerLock = canvas.requestPointerLock ||
           canvas.mozRequestPointerLock ||
           canvas.webkitRequestPointerLock;
      canvas.requestPointerLock();
    }
  }

  isDown(control){
    try{
      var gamepads = [];
      if(this.gamepad){
        gamepads = navigator.getGamepads()
      }
      if(this.gamepad && gamepads[this.gamepad.slot]){
          var controls = this.gamepad.controls;
          if('button' in controls[control]){
              return gamepads[this.gamepad.slot].buttons[controls[control].button].value || this.mapping[control].pressed
          }else if('axis' in controls[control]){
              return controls[control].value(gamepads[this.gamepad.slot].axes[controls[control].axis]) || this.mapping[control].pressed
          }
      }
    }catch(e){

    }
    return this.mapping[control].pressed
  }

  getValue(control){
    try{
      var gamepads = [];
      if(this.gamepad){
        gamepads = navigator.getGamepads()
      }
      if(this.gamepad && gamepads[this.gamepad.slot]){
          var controls = this.gamepad.controls;

          if('button' in controls[control]){
              //TODO what goes here?
          }else if('axis' in controls[control]){
              // console.log(control)
              // console.log(controls[control].value(gamepads[this.gamepad.slot].axes[controls[control].axis]))
              if(Math.abs(this.mapping[control].value) > Math.abs(controls[control].value(gamepads[this.gamepad.slot].axes[controls[control].axis]))){
                return this.mapping[control].value
              }else{
                return controls[control].value(gamepads[this.gamepad.slot].axes[controls[control].axis])
              }
          }
      }
    }catch(e){

    }
    return this.mapping[control].value
  }
}

function convertToKey(keycode){
  return String.fromCharCode(keycode).toLowerCase()
}

export default Controller
