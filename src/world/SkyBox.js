
const geometry = new THREE.SphereGeometry( 10000, 64, 32 );
const vertices = geometry.vertices;
const faces = geometry.faces;

const colorTop = new THREE.Color( 0x001F4B );
const colorMiddle = new THREE.Color( 0x1A3C62 );
const colorBottom = new THREE.Color( 0x596F87 );

for ( let i = 0, l = faces.length; i < l; i ++ ) {

  const face = faces[ i ];

  const vertex1 = vertices[ face.a ];
  const vertex2 = vertices[ face.b ];
  const vertex3 = vertices[ face.c ];

  const color1 = colorMiddle.clone();
  color1.lerp( vertex1.y > 0 ? colorTop : colorBottom, Math.abs( vertex1.y ) / 6000 );

  const color2 = colorMiddle.clone();
  color2.lerp( vertex2.y > 0 ? colorTop : colorBottom, Math.abs( vertex2.y ) / 6000 );

  const color3 = colorMiddle.clone();
  color3.lerp( vertex3.y > 0 ? colorTop : colorBottom, Math.abs( vertex3.y ) / 6000 );

  face.vertexColors.push( color1, color2, color3 );

}

const material = new THREE.MeshBasicMaterial( {
  vertexColors: THREE.VertexColors,
  side: THREE.BackSide,
  depthWrite: false,
  depthTest: false,
  fog: false
} );

export default () => new THREE.Mesh( geometry, material );
