const material = new THREE.MeshLambertMaterial({
  color: 0x222222
});

export default ( x = 10, y = 20, z = 1 ) => {

  const box = new THREE.BoxGeometry( x, y, z );
  return new THREE.Mesh( box, material );

};
