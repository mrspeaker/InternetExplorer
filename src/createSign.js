import Sign from "./world/Sign";

const createSign = ( posts ) => posts.map( p => {

  const label = Sign( p.data.title, p.data.url );

  label.position.set(
    Math.random() * 20,
    1,
    Math.random() * 120
  );

  label.rotation.y = Math.PI;

  return label;

});

export default createSign;
