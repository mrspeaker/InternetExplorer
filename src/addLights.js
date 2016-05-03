const THREE = window.THREE;

export default scene => {
  /*
  const amb = new THREE.AmbientLight( 0x222222 );
  scene.add(amb);

  const pointy = new THREE.PointLight( 0xff44ee, 0, 30 );
  pointy.position.set( 0, -2, 0 );
  dolly.add( pointy );
  */

  const hemiLight = new THREE.HemisphereLight( 0xFFF5CE, 0xffffff, 0.6 );
  hemiLight.position.set( 0, 100, 0 );
  scene.add( hemiLight );

  const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.position.set( 0, 100, 55 );
  dirLight.castShadow = true;
  dirLight.shadowCameraVisible = true;

  const d = 100;

  dirLight.shadowCameraFar = 3500;
  //dirLight.shadowBias = -0.001;
  dirLight.shadowCameraRight = d;
  dirLight.shadowCameraLeft = -d;
  dirLight.shadowCameraTop = d;
  dirLight.shadowCameraBottom = -d;
  dirLight.shadowDarkness = 0.3;

  scene.add( dirLight );
  
};
