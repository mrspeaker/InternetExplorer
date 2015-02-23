import createCanvasPlane from "../createCanvasPlane";
import wrapCanvasText from "../wrapCanvasText";
import ImgUrMesh from "./ImgUrMesh";
import Oblisk from "./Oblisk";

const Sign = ( title = "title", url ) => {

  const group = new THREE.Group();

  const ob = Oblisk( 6, 9, 0.5 );
  ob.position.set( 0, 2, 0 )
  group.add( ob );

  const text = createCanvasPlane( 256, 256, ( ctx, w, h ) => {

    ctx.font = "22pt Helvetica";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    wrapCanvasText( ctx, title, 0, 30, w, 30 );

  });
  text.position.set( 0, 4.1, 0.28 );
  group.add( text );

  if ( url.indexOf( "imgur.com" ) >= 0 ) {

    const img = ImgUrMesh( url );
    img.position.set( 0, 1.5, 0.29 );
    group.add( img );

  }

  return group;
}

export default Sign;
