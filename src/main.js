import RedditAPI from "./RedditAPI";
import Keys from './KeyboardArrowAndActionControls';
import SkyBox from "./SkyBox";
import ground from "./ground";
import Oblisk from "./Oblisk";
import ImgUrMesh from "./ImgUrMesh";
import createSign from "./createSign";

let camera, scene, renderer;
let controls, effect, dolly;
let manager;

const keys = new Keys();
const speed = 0.1;

let xo = 0,
    zo = 0;

function init() {

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.autoClear = false;
  renderer.setClearColor(0x404040);

  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcacfde, 0, 1000);
  dolly = new THREE.Group();
  dolly.position.set(0, 1, 0);
  scene.add(dolly);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.z = 0.0001;
  dolly.add(camera);

  // Effect and Controls for VR
  effect = new THREE.VREffect(renderer);
  controls = new THREE.VRControls(camera);

  // Initialize the WebVR manager.
  manager = new WebVRManager(effect);

  scene.add(SkyBox());
  scene.add(ground);
  const ob = Oblisk();
  ob.position.set(0, 5, 10);
  scene.add(ob);

  // lights
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
  directionalLight.position.set(-1, 1, -1);
  scene.add(directionalLight);

  var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
  hemisphereLight.position.set(-1, 2, 1.5);
  scene.add(hemisphereLight);

  RedditAPI.load("gamedev")
    .then(createSign)
    .then(signs => signs.forEach(sign => scene.add(sign)));

  let imgMesh = ImgUrMesh("dAvWkN8.jpg");
  imgMesh.position.set(0, 7, 9);
  scene.add(imgMesh);

  requestAnimationFrame( animate );
  window.addEventListener("resize", onWindowResize, false);
  onWindowResize();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );

};


function animate(time) {

  requestAnimationFrame(animate);

  if (controls) {
    controls.update();
  }

  dolly.translateZ(-keys.y() * speed);
  dolly.rotation.y -= keys.x() * (speed * 0.2);

  if (manager.isVRMode()) {
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }

}

init();

export default {};
