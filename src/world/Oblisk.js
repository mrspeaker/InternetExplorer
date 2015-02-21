var box = new THREE.BoxGeometry(10, 20, 1);
var boxM = new THREE.MeshBasicMaterial({
  color: 0x000000,
  fog: false
});
var boxMesh = () => new THREE.Mesh(box, boxM);

export default boxMesh;