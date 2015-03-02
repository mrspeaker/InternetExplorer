// floor
const grassTex = THREE.ImageUtils.loadTexture('img/sand.jpg');
grassTex.wrapS = THREE.RepeatWrapping;
grassTex.wrapT = THREE.RepeatWrapping;
grassTex.repeat.x = 2046;
grassTex.repeat.y = 2046;

const ground = new THREE.Mesh(
  new THREE.PlaneBufferGeometry( 10000, 10000 ),
  new THREE.MeshBasicMaterial({ map: grassTex }) );

ground.position.y = 0;
ground.rotation.x = - Math.PI / 2;
ground.renderDepth = 2;
ground.receiveShadow = true;

export default ground;

