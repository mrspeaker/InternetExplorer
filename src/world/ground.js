// floor
var geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
var material = new THREE.MeshLambertMaterial({
  color: 0x26463E,
  opacity: 0.9,
  transparent: true
});
let water = new THREE.Mesh( geometry, material );
water.position.y = 0;
water.rotation.x = - Math.PI / 2;
water.renderDepth = 2;

export default water;