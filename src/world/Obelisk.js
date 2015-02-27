const material = new THREE.MeshPhongMaterial({
  color: 0x222222
});

export default ( x = 10, y = 20, z = 1 ) => {

  const box = new THREE.BoxGeometry( x, y, z );
  const mesh = new THREE.Mesh( box, material );

  mesh.castShadow = true;

  return mesh;

};
