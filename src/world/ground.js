// floor
const grassTex = THREE.ImageUtils.loadTexture('img/sand.jpg');
grassTex.wrapS = THREE.RepeatWrapping;
grassTex.wrapT = THREE.RepeatWrapping;
grassTex.repeat.x = 2046;
grassTex.repeat.y = 2046;
const groundMat = new THREE.MeshBasicMaterial({map:grassTex});


const geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
const material = new THREE.MeshLambertMaterial({
  color: 0x26463E
});

const ground = new THREE.Mesh( geometry, groundMat );
ground.position.y = 0;
ground.rotation.x = - Math.PI / 2;
ground.renderDepth = 2;
ground.receiveShadow = true;

export default ground;

