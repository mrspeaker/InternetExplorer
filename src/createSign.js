import Sign from "./world/Sign";

let meshes = posts => posts.map( p => Sign( p.data.title, p.data.url ) );

export default meshes;
