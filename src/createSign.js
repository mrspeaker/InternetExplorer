import Sign from "./world/Sign";

const meshes = posts => posts.map( ({ data: { title, url } }) => Sign( title, url ) );

export default meshes;
