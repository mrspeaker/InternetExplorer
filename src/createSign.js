import Sign from "./world/Sign";

const createSign = ( posts ) => posts.map( p => {

  const label = Sign( p.data.title, p.data.url );

  label.position.set(
    Math.random() * 70,
    1,
    Math.random() * 100
  );

  label.rotation.y = Math.random() * (Math.PI * 2)

  label.rotation.y = (Math.PI / 2) + (Math.random() * Math.PI);

  return label;

});

export default createSign;
