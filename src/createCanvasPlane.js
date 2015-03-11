const createCanvasPlane = function ( w, h, drawFunc ) {

  const canvas = document.createElement( "canvas" );
  const ctx = canvas.getContext( "2d" );
  const scale = 0.01;

  canvas.width = w;
  canvas.height = h;

  drawFunc( ctx, w, h );

  const texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true
  });

  const geometry = new THREE.PlaneBufferGeometry( w, h, 1, 1 );
  const planeMesh = new THREE.Mesh( geometry, material );

  planeMesh.scale.set( scale, scale, scale );

  return planeMesh;

};

export default createCanvasPlane;
