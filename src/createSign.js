import createCanvasPlane from "./createCanvasPlane";
import wrapCanvasText from "./wrapCanvasText";

const createSign = (posts) => posts.map(p => {

  const label = createCanvasPlane(256, 256, function (ctx, w, h) {

    ctx.font = "22pt Helvetica";

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    wrapCanvasText(ctx, p.data.title, 0, 30, w, 30)

  });

  label.position.set(
    Math.random() * 20,
    1,
    Math.random() * 120
  );

  label.rotation.y = Math.PI;

  return label;

});

export default createSign;