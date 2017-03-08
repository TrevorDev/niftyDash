import THREE = require("three")

export default {
	createFromObject: (obj:THREE.Mesh)=>{
		var box = new THREE.Box3()
		var verts:THREE.Vector3[] = obj.geometry.vertices
    	verts = verts.map((v)=>{return v.clone().add(obj.position)})
    	box.setFromPoints(verts)
    	return box
	}
}