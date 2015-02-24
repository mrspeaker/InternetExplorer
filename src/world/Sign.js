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
  group._data = {
    title
  };

  if ( url && url.indexOf( "imgur.com" ) >= 0 ) {

    if ( url.endsWith( ".gifv" ) ) {

      url = url.slice(4) + ".gif";
      console.log ("CHANGED to:", url)

    }

    if ( ! ( url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".gif") ) ) {

      console.log("NOP?", url)
      url += ".jpg";

    }

    if ( url.startsWith( "http://imgur" ) ) url = "http://i." + url.slice(7);
    if ( url.startsWith( "https://imgur" ) ) url = "https://i." + url.slice(8);

    const img = ImgUrMesh( url );
    img.position.set( 0, 1.5, 0.29 );
    group.add( img );

  }

  return group;
}

export default Sign;
