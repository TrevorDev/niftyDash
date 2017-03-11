import THREE = require("three")

export default {
	createFromObject: (obj:THREE.Mesh)=>{
		var box = new THREE.Box3()
		var geo:any = obj.geometry
		var verts:THREE.Vector3[] = geo.vertices
    	verts = verts.map((v)=>{return v.clone().add(obj.position)})
    	box.setFromPoints(verts)
    	return box
	}
}