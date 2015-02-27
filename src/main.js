import KeyboardControls from "./KeyboardControls";
import KeyboardFieldInput from "./KeyboardFieldInput";
import World from "./world/World";
import Stats from "stats-js";
import createCanvasPlane from "./createCanvasPlane";


window.debug = false;
let showTypeBox = false;

const keys = new KeyboardControls();
const field = new KeyboardFieldInput( ( prog, done ) => {

  if ( done ) {

    showTypeBox = false;

    if ( !prog ) return;

    if ( prog === "prod" ) {

      window.debug = !window.debug;
      return;

    }

    const { x, z } = dolly.position;

    World.loadSub( prog, x, z, dolly.rotation.y + Math.PI);

  } else {

      showTypeBox = true;
      scene.remove(t);
      t = TypeText("/" + (prog ? prog : ""));
      scene.add(t);

  }

});

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


const stats = new Stats();
{
  const dom = stats.domElement;
  const style = dom.style;
  stats.setMode( 0 );
  style.position = "absolute";
  style.left = "0px";
  style.top = "0px";
  document.body.appendChild( dom );
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setClearColor( 0x222222 );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x000000, 0, 350 );

const dolly = new THREE.Group();
dolly.position.set( -15, 0, 5 );
scene.add(dolly);

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.set(0, 1, 0);
dolly.add( camera );
dolly.rotation.y = - Math.PI / 2;

// Effect and Controls for VR, Initialize the WebVR manager
const effect = new THREE.VREffect( renderer );
const controls = new THREE.VRControls( camera );
const manager = new WebVRManager( effect );

// lights
{
  const amb = new THREE.AmbientLight( 0x111111 );
  scene.add(amb);

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.35 );
  directionalLight.position.set( -1, 1, -1 );
  scene.add( directionalLight );

  const pointy = new THREE.PointLight( 0x0044ee, 0, 30 );
  pointy.position.set( 0, -2, 0 );
  dolly.add( pointy );

}

scene.add( World.mesh );

requestAnimationFrame( animate );
window.addEventListener( "resize", onWindowResize, false );
onWindowResize();

const loadText = createCanvasPlane( 256, 60, ( ctx, w, h ) => {

  ctx.textAlign = "center";
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "22pt Helvetica";
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillText( "Hit 'enter' to load.", w / 2, 30 );

});
loadText.position.set( 3, -10, 3 );
scene.add( loadText );

const TypeText = (text) => {
  const plane = createCanvasPlane( 256, 60, ( ctx, w, h ) => {

    ctx.textAlign = "center";
    ctx.fillStyle = "#225";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "22pt Helvetica";
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillText( text, w / 2, 30 );

  });
  plane.scale.set(0.005, 0.005, 0.005);
  return plane;
}
let t = TypeText("Type");
t.position.set( 3, 1, 3 );
scene.add( t );

World.loadSub(
  [ "aww", "pics", "funny", "mildlyinteresting" ][ Math.random() * 4 | 0 ],
  dolly.position.x,
  dolly.position.z,
  dolly.rotation.y + Math.PI
);

dolly.translateZ( 20 );
dolly.rotation.y -= 0.2;


function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );

};

function animate ( time ) {

  stats.begin();


  requestAnimationFrame( animate );


  controls.update();

  moves.arot = keys.rot() * moves.rotPower;
  moves.vrot += moves.arot;
  moves.vrot *= moves.drag;

  dolly.rotation.y -= moves.vrot;

  /*if ( manager.isVRMode() ) {

    dolly.translateX( keys.x() * speed );
    dolly.translateZ( keys.y() * speed );

  } else */ {
    moves.ax = keys.x() * moves.power;
    moves.az = keys.y() * moves.power;

    moves.vx += moves.ax;
    moves.vz += moves.az;

    moves.vx *= moves.drag;
    moves.vz *= moves.drag;

    dolly.translateX( moves.vx );
    dolly.translateZ( moves.vz );

  }

  dolly.translateY( keys.vert() * (moves.power * 3) );

  if (dolly.position.y < 0) dolly.position.y = 0;

  if ( keys.zero() ) {

    controls.zeroSensor();

  }

  whatAreYouLookingAt();

  if ( showTypeBox ) {

    t.position.copy(dolly.position);
    t.rotation.copy(dolly.rotation);
    t.translateZ(-2);
    t.translateY(1.5);

  } else {

    t.position.y = -10;

  }

  if ( manager.isVRMode() ) {

    effect.render( scene, camera );

  } else {

    renderer.render( scene, camera );

  }

  stats.end();

}

const whatAreYouLookingAt = () => {

  const direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
  const raycaster = new THREE.Raycaster( dolly.position, direction, 0, 10 );
  const intersects = raycaster.intersectObjects( World.mesh.children, true );

  if (intersects.length) {

    const sign = intersects[ 0 ].object.parent;
    if ( sign && sign._data ) {

      const title = sign._data.title
      const isSubReddit = title.match( /\/r\/[a-zA-Z_]+$/g )

      sign.scale.x = 1 + ( ( Math.sin( Date.now() / 1000 ) + 1 ) * 0.03 );

      if ( isSubReddit ) {

        loadText.position.copy( sign.position );
        loadText.rotation.copy( sign.rotation );
        loadText.translateZ( 1 );
        loadText.position.y = 2.8;

      }

      if ( keys.enter() && isSubReddit ) {

        const sub = title.slice( 3 );
        const { x, z } = dolly.position;

        World.loadSub( sub, x, z, sign.rotation.y + Math.PI );
        keys.enter( true );

        sign.parent.remove( sign );
        loadText.position.set( 3, -10, 3 ); // Hide loadTExt box

      }

      if ( keys.action() ) {

        sign.parent.remove( sign );
        keys.action( true );

      }

    }

  }

}

export default {};
