import Keys from './KeyboardArrowAndActionControls';
import World from "./world/World";

const keys = new Keys();
const speed = 0.1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setClearColor( 0x404040 );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0xcacfde, 0, 1000 );

const dolly = new THREE.Group();
dolly.position.set( 0, 1, 0 );
scene.add(dolly);

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.z = 0.0001;
dolly.add( camera );

// Effect and Controls for VR, Initialize the WebVR manager
const effect = new THREE.VREffect( renderer );
const controls = new THREE.VRControls( camera );
const manager = new WebVRManager( effect );

// lights
{

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.15 );
  directionalLight.position.set( -1, 1, -1 );
  scene.add( directionalLight );

  const hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.8 );
  hemisphereLight.position.set( -1, 2, 1.5 );
  scene.add( hemisphereLight );

}

scene.add( World );

requestAnimationFrame( animate );
window.addEventListener( "resize", onWindowResize, false );
onWindowResize();


function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize(window.innerWidth, window.innerHeight);

};


function animate ( time ) {

  requestAnimationFrame( animate );

  controls.update();

  dolly.translateZ( keys.y() * speed );
  dolly.rotation.y -= keys.x() * ( speed * 0.2 );

  if (manager.isVRMode()) {

    effect.render( scene, camera );

  } else {

    renderer.render( scene, camera );

  }

}

export default {};
