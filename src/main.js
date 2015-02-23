import Keys from './KeyboardArrowAndActionControls';
import World from "./world/World";

const keys = new Keys();
const speed = 0.2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setClearColor( 0x222222 );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x000000, 0, 100 );

const dolly = new THREE.Group();
dolly.position.set( 0, 0, -Math.PI );
//dolly.lookAt(new THREE.Vector3(0, 0, 0))
scene.add(dolly);

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.set(0, 1, 0);
dolly.add( camera );

// Effect and Controls for VR, Initialize the WebVR manager
const effect = new THREE.VREffect( renderer );
const controls = new THREE.VRControls( camera );
const manager = new WebVRManager( effect );

//controls.zeroSensor();

// lights
{

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.85 );
  directionalLight.position.set( -1, 1, -1 );
  scene.add( directionalLight );

  const pointy = new THREE.PointLight( 0x0044ee, 0, 30 );
  pointy.position.set( 0, -2, 0 );
  dolly.add( pointy );

}

scene.add( World );

requestAnimationFrame( animate );
window.addEventListener( "resize", onWindowResize, false );
onWindowResize();


function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );

};

function animate ( time ) {

  requestAnimationFrame( animate );

  controls.update();

  //dolly.quaternion.copy(camera.quaternion);
  dolly.rotation.y -= keys.x() * ( speed * 0.12 );
  dolly.translateZ( -keys.y() * speed );

  if ( manager.isVRMode() ) {

    effect.render( scene, camera );

  } else {

    renderer.render( scene, camera );

  }

}

export default {};
