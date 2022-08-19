import createCanvasPlane from "../primatives/createCanvasPlane.js";
import wrapCanvasText from "../primatives/wrapCanvasText.js";
import Obelisk from "./Obelisk.js";

const Link = ( title = "title", url ) => {

  const group = new THREE.Group();

  const ob = Obelisk( 6, 5, 0.5 );
  ob.position.set( 0, 2.5, 0 )
  group.add( ob );

  const text = createCanvasPlane( 256, 256, ( ctx, w, h ) => {

    ctx.font = "22pt Helvetica, Arial, Sans-Serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    wrapCanvasText( ctx, title, 0, 30, w, 30 );

  });
  text.position.set( 0, 1.5, 0.28 );
  group.add( text );
  group._data = {
    title
  };

  return group;
}

export default Link;
