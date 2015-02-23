import createCanvasPlane from "../createCanvasPlane";
import wrapCanvasText from "../wrapCanvasText";
import ImgUrMesh from "./ImgUrMesh";

const Sign = ( title = "title", url ) => {

  const group = new THREE.Group();
  const text = createCanvasPlane( 256, 256, function ( ctx, w, h ) {

    ctx.font = "22pt Helvetica";

    ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, w, h );

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    wrapCanvasText( ctx, title, 0, 30, w, 30 );

  });

  group.add( text );

  if ( url.indexOf( "imgur.com" ) >= 0 ) {

    const img = ImgUrMesh( url );
    img.position.set( 0, 1, 0 );
    group.add( img );
    text.position.set( 0, 3.5, -0.1 );

  }

  return group;
}

export default Sign;
