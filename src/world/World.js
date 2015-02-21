const world = new THREE.Group();

import RedditAPI from "../RedditAPI";
import SkyBox from "./SkyBox";
import ground from "./ground";
import Oblisk from "./Oblisk";
import ImgUrMesh from "./ImgUrMesh";
import createSign from "../createSign";

world.add(SkyBox());

world.add(ground);

const ob = Oblisk();
ob.position.set(0, 5, 10);
world.add(ob);

RedditAPI.load("gamedev")
  .then(createSign)
  .then(signs => signs.forEach(sign => world.add(sign)));

let imgMesh = ImgUrMesh("dAvWkN8.jpg");
imgMesh.position.set(0, 7, 9);
world.add(imgMesh);

export default world;
