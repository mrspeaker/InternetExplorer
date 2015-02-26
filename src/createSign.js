import Sign from "./world/Sign";

const meshes = posts => posts.map( ({ data }) => Sign( data.title, data.url ) );

export default meshes;
