import createCanvasPlane from "../createCanvasPlane";
import wrapCanvasText from "../wrapCanvasText";
import ImgUrMesh from "./ImgUrMesh";
import Obelisk from "./Obelisk";

const Instructions = () => {

  const group = new THREE.Group();

  const ob = Obelisk( 6, 7, 0.5 );
  ob.position.set( 0, 3.5, 0 )
  group.add( ob );

  const text = createCanvasPlane( 350, 256, ( ctx, w, h ) => {

    const lineHeight = 35;
    let offset = 0;

    ctx.font = "20pt Helvetica, Arial, Sans-Serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("/ to enter typing mode", 0, offset += lineHeight);
    ctx.fillText("WSAD: Move", 0, offset += lineHeight);
    ctx.fillText("Arrows: Rotate", 0, offset += lineHeight);
    ctx.fillText("Q/E: Up 'n down", 0, offset += lineHeight);
    ctx.fillText("Enter: Load a /r/ obelisk", 0, offset += lineHeight);
    ctx.fillText("Space: Remove an obelisk", 0, offset += lineHeight);
    ctx.fillText("Z: reset VR sensor", 0, offset += lineHeight);

  });
  text.position.set( -0.2, 5.2, 0.28 );
  group.add( text );

  const img = ImgUrMesh( "dAvWkN8.jpg" );
  img.position.set( 0, 2, 0.29 );
  img.scale.y = 0.8;
  group.add( img );

  return group;
}

export default Instructions;
