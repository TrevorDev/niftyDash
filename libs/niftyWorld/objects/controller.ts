class Mapping {
  constructor(public input, public mapping, public pressed:boolean, public value){

  }
}

class Controller {
  input = {};
  mapping = {};

  constructor(controls){
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
        if(key == "mouseX"){
          this.input[key].value += movementX;
        }
        if(key == "mouseY"){
          this.input[key].value += movementY;
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
    return this.mapping[control].pressed
  }

  getValue(control){
    return this.mapping[control].value
  }
}

function convertToKey(keycode){
  return String.fromCharCode(keycode).toLowerCase()
}

export default Controller
