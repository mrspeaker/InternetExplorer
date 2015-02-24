const ImgUrMesh = ( imgName = "dAvWkN8.jpg" ) => {

  THREE.ImageUtils.crossOrigin = "Anonymous";
  const url = imgName.startsWith( "http" ) ? imgName : `http://i.imgur.com/${ imgName }`

  const texture = THREE.ImageUtils.loadTexture( url, undefined, (data) => {}, (err) => {
    console.log("Error loading texture:", url, imgName, err);
  } );

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  const geometry = new THREE.PlaneBufferGeometry( 4, 4 );

  return new THREE.Mesh( geometry, material );

}

export default ImgUrMesh;
