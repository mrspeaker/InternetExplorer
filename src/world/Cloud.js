const speed = 0.01;

const material = new THREE.MeshLambertMaterial( { color: 0xeeeeee } );

const make = ( { x, y, z } ) => {

  const geometry = new THREE.BoxGeometry(
      Math.random() * 30 + 15,
      1,
      Math.random() * 40 + 15
  );
  const mesh = new THREE.Mesh( geometry, material );

  const posVec3 = new THREE.Vector3( x, y, z );
  mesh.position.copy( posVec3 );
  mesh.lookAt( posVec3.add( new THREE.Vector3( 0, 0, 1 ) ) );

  return mesh;

};

const move = ( cloud ) => {

  cloud.translateZ( speed );

  if ( cloud.position.z > 1000 ) {

    cloud.position.z -= 2000;
    cloud.position.x = Math.random() * 500 - 250;

  }

};

export default {
  move,
  make
};
