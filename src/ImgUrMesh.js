
function ImgUrMesh (imgName = "dAvWkN8.jpg") {

  THREE.ImageUtils.crossOrigin = ""; //Anonymous";
  const texture = THREE.ImageUtils.loadTexture(`http://i.imgur.com/${ imgName }`);
  const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
  const geometry = new THREE.PlaneBufferGeometry(4, 4);
  return new THREE.Mesh(geometry, material);

}

export default ImgUrMesh;

