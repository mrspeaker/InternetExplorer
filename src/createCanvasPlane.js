const createCanvasPlane = function ( w, h, drawFunc ) {

  let canvas = document.createElement( "canvas" ),
    ctx = canvas.getContext( "2d" ),
    scale = 0.01,
    texture,
    material,
    geometry,
    planeMesh;

  canvas.width = w;
  canvas.height = h;

  drawFunc( ctx, w, h );

  texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  material = new THREE.MeshBasicMaterial({
    map: texture,
    // side: THREE.DoubleSide,
    transparent: true
  });

  geometry = new THREE.PlaneBufferGeometry( canvas.width, canvas.height, 1, 1 );
  planeMesh = new THREE.Mesh( geometry, material );

  planeMesh.scale.set( scale, scale, scale );

  return planeMesh;

};

export default createCanvasPlane;
