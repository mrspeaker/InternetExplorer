import Sign from "./world/Sign";

const createSign = ( posts ) => posts.map( p => {

  const label = Sign( p.data.title, p.data.url );
  return label;

});

export default createSign;
