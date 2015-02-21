import createCanvasPlane from "../createCanvasPlane";
import wrapCanvasText from "../wrapCanvasText";

const Sign = (title = "title") => createCanvasPlane(256, 256, function (ctx, w, h) {

  ctx.font = "22pt Helvetica";

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  wrapCanvasText(ctx, title, 0, 30, w, 30)

});

export default Sign;