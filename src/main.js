import KeyboardControls from "./KeyboardControls";
import KeyboardFieldInput from "./KeyboardFieldInput";
import TextLinePlane from "./primatives/TextLinePlane";

import World from "./world/World";
import Stats from "./stats";
import Cloud from "./world/Cloud";
import addLights from "./addLights";

window.debug = false;
const THREE = window.THREE;
let showTypeBox = false;

const moves = {
  vx: 0.0,
  vz: 0.0,
  ax: 0.0,
  az: 0.0,

  vrot: 0.0,
  arot: 0.0,

  power: 0.01,
  rotPower: 0.0015,
  drag: 0.95
};

const keys = new KeyboardControls();
new KeyboardFieldInput( ( prog, done ) => {

  if ( done ) {

    showTypeBox = false;

    if ( !prog ) return;

    if ( prog === "prod" ) {

      window.debug = !window.debug;
      return;

    }

    const { x, y, z } = dolly.position;

    World.load( prog, { x, y, z }, dolly.rotation.y + Math.PI );

  } else {

    showTypeBox = true;
    scene.remove( typeyText );
    typeyText = TextLinePlane( "/" + ( prog ? prog : "" ));
    typeyText.scale.set( 0.005, 0.005, 0.005 );
    scene.add( typeyText );

  }

});

const stats = Stats();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setClearColor( 0x222222 );
renderer.shadowMapEnabled = true;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x103258, 20, 200 );

const dolly = new THREE.Group();
dolly.position.set( -15, 0.4, 5 );
scene.add(dolly);

const clouds = Array.from(
  new Array( 100 ),
  () => Cloud.make({
    x: Math.random() * 1000 - 500,
    y: 40,
    z: Math.random() * 1000 - 500
  })
);

clouds.forEach(c => scene.add( c ));

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.set( 0, 1, 0 );
dolly.add( camera );
dolly.rotation.y = - Math.PI / 2;

// Effect and Controls for VR, Initialize the WebVR manager
const effect = new THREE.VREffect( renderer );
const controls = new THREE.VRControls( camera );
const manager = new window.WebVRManager( effect );

// lights
addLights( scene );

scene.add( World.mesh );

const loadText = TextLinePlane( "Hit 'enter' to load." );
loadText.position.set( 3, -10, 3 );
scene.add( loadText );

let typeyText = TextLinePlane( "/" );
scene.add( typeyText );

World.load(
  [ "aww", "pics", "funny", "mildlyinteresting" ][ Math.random() * 4 | 0 ],
  { x: dolly.position.x, y: 0, z: dolly.position.z },
  dolly.rotation.y + Math.PI
);

dolly.translateZ( 20 );
dolly.rotation.y -= 0.2;

function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );

}

function animate ( time ) {

  stats.begin();

  requestAnimationFrame( animate );

  controls.update();

  // Rotation
  moves.arot = keys.rot() * moves.rotPower;
  moves.vrot += moves.arot;
  moves.vrot *= moves.drag;

  dolly.rotation.y -= moves.vrot;

  // Movement
  moves.ax = keys.x() * moves.power;
  moves.az = keys.y() * moves.power;
  moves.vx += moves.ax;
  moves.vz += moves.az;
  moves.vx *= moves.drag;
  moves.vz *= moves.drag;

  dolly.translateX( moves.vx );
  dolly.translateZ( moves.vz );
  dolly.translateY( keys.vert() * (moves.power * 3.5) );

  // Stay above ground
  if (dolly.position.y < 0) dolly.position.y = 0;

  if ( keys.zero() ) {

    controls.zeroSensor();

  }

  whatAreYouLookingAt();

  if ( showTypeBox ) {

    typeyText.position.copy( dolly.position );
    typeyText.rotation.copy( dolly.rotation );
    typeyText.translateZ( -2 );
    typeyText.translateY( 1.5 );

  } else {

    typeyText.position.y = -10;

  }

  if ( manager.isVRMode() ) {

    effect.render( scene, camera );

  } else {

    renderer.render( scene, camera );

  }

  clouds.forEach(c => Cloud.move( c ));

  stats.end();

}

const whatAreYouLookingAt = () => {

  const direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
  const raycaster = new THREE.Raycaster( dolly.position, direction, 0, 10 );
  const intersects = raycaster.intersectObjects( World.mesh.children, true );

  if ( intersects.length ) {

    const sign = intersects[ 0 ].object.parent;
    if ( sign && sign._data ) {

      const title = sign._data.title;
      const isSubReddit = title.match( /\/r\/[a-zA-Z_]+$/g );

      sign.scale.x = 1 + ( ( Math.sin( Date.now() / 1000 ) + 1 ) * 0.03 );

      if ( isSubReddit ) {

        loadText.position.copy( sign.position );
        loadText.rotation.copy( sign.rotation );
        loadText.translateZ( 1 );
        loadText.position.y = 3.8;

      }

      if ( keys.enter() && isSubReddit ) {

        const sub = title.slice( 3 );
        const { x, z } = dolly.position;

        World.load( sub, { x, y: sign.position.y, z }, sign.rotation.y + Math.PI );
        keys.enter( true );

        sign.parent.remove( sign );
        loadText.position.set( 3, -10, 3 ); // Hide loadTExt box

      }

      if ( keys.action() ) {

        sign.parent.remove( sign );
        keys.action( true );

      }

    }

  } else {

    loadText.position.y = -10;

  }

};

function run () {

  document.body.appendChild( renderer.domElement );

  requestAnimationFrame( animate );
  window.addEventListener( "resize", onWindowResize, false );
  onWindowResize();

}

export default () => { run(); };
