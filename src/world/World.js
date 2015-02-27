import RedditAPI from "../RedditAPI";
import SkyBox from "./SkyBox";
import ground from "./ground";
import Obelisk from "./Obelisk";
import ImgUrMesh from "./ImgUrMesh";
import Sign from "./Sign";
import createSigns from "../createSign";

const world = new THREE.Group();
world.add( SkyBox() );
world.add( ground );

const ob = Obelisk();
ob.scale.y = 0.5;
ob.position.set( -20, 3.5, 18 );
ob.rotation.y = Math.PI / 4;
world.add( ob );

const imgMesh = ImgUrMesh( "dAvWkN8.jpg" );
imgMesh.position.copy( ob.position );
imgMesh.rotation.y = ob.rotation.y;
imgMesh.translateZ( -0.55)
world.add( imgMesh );

const positionSigns = ( signs, x, z, rot ) => {

  const placer = new THREE.Object3D();
  placer.position.set( x, 1, z );
  placer.rotation.y = rot !== undefined ? rot : Math.random() * (2 * Math.PI);

  const off = Math.random() * 2 - 1;
  const dir = Math.random() < 0.5 ? Math.sin : Math.cos
  const dist = (Math.random() * 13 | 0) + 5;

  return signs.map ( ( sign, i ) => {

    sign.rotation.y = placer.rotation.y + ((i % 2 === 0 ? -1 : 1) * Math.PI / 2);
    sign.position.copy( placer.position );
    sign.translateZ( -9 );

    placer.translateX( dir((off + i) / dist) * 0.7)
    placer.translateZ( 3.5 );

    return sign;

  });

}

const loadSub = ( subReddit, x = 0, z = 0, rot ) => RedditAPI
  .load( subReddit )
  .then( createSigns )
  .then( signs => positionSigns( signs, x, z, rot ) )
  .then( signs => signs.map( sign => {

    world.add( sign );
    return sign;

  } ) )
  .then( signs => {
    rot = rot == undefined ? 0 : rot;
    rot += (Math.random () < 0.5 ? -1 : 1) * (Math.PI / 4);
    const { x, z } = signs[ signs.length - 1 ].position;
    findRelatedSubs( subReddit, x, z, rot );

  });

const findRelatedSubs = ( subReddit, x = 0, z = 0, rot ) => RedditAPI
  .loadAboutSub( subReddit )
  .then(
    about => about.description
      .match( /\/r\/[a-zA-Z_]+/g )
      .map( sub => sub.toLowerCase() )
      .filter( ( value, index, self ) => self.indexOf( value ) === index )
  )
  .then( related => related.map( sub => Sign( sub ) ) )
  .then( signs => positionSigns( signs, x, z, rot ) )
  .then( signs => signs.map( sign => {

    sign.position.y = -3;
    return sign;

  }))
  .then( signs => signs.map( sign => world.add( sign ) ) )

export default {
  loadSub,
  mesh: world
};
