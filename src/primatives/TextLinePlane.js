import createCanvasPlane from "./createCanvasPlane";

const TextLinePlane = text => createCanvasPlane( 256, 60, ( ctx, w, h ) => {

  ctx.textAlign = "center";
  ctx.fillStyle = "#113";
  ctx.fillRect( 0, 0, w, h );
  ctx.font = "22pt Helvetica";
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillText( text, w / 2, 35 );

});

export default TextLinePlane;
