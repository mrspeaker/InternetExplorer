import RedditAPI from "../RedditAPI";
import SkyBox from "./SkyBox";
import ground from "./ground";
import Oblisk from "./Oblisk";
import ImgUrMesh from "./ImgUrMesh";
import Sign from "./Sign";
import createSigns from "../createSign";

const world = new THREE.Group();

world.add( SkyBox() );
world.add( ground );

const ob = Oblisk();
ob.position.set( 0, 5, 10 );
world.add( ob );

const imgMesh = ImgUrMesh( "dAvWkN8.jpg" );
imgMesh.position.set( 0, 5, 9.3 );
world.add( imgMesh );

const positionSigns = ( signs, x, z ) => {

  const placer = new THREE.Object3D();
  placer.position.set( x, 1, z );
  placer.rotation.y = Math.random() * Math.PI;

  return signs.map ( (sign, i) => {
    sign.position.copy( placer.position );
    /*sign.position.set(
      35 - ( Math.random() * 70 ) + x,
      1,
      35 - ( Math.random() * 70 ) + z
    );*/

    sign.rotation.y = placer.rotation.y - Math.PI / 2;
    //sign.rotation.y = ( Math.PI / 2 ) + ( Math.random() * Math.PI );

    placer.translateZ(6);

    return sign;

  });

}

const loadSub = ( subReddit, x = 0, z = 0 ) => RedditAPI
  .load( subReddit )
  .then( createSigns )
  .then( signs => positionSigns( signs, x, z ) )
  .then( signs => signs.map( sign => {

    world.add( sign );
    return sign;

  } ) )
  .then( signs => {

    const { x, z } = signs[ signs.length - 1 ].position;
    findRelatedSubs( subReddit, x, z );

  });

const findRelatedSubs = ( subReddit, x = 0, z = 0 ) => RedditAPI
  .loadAboutSub( subReddit )
  .then( about => about.description
    .match( /\/r\/[a-zA-Z]+/g )
    .map( sub => sub.toLowerCase() )
    .filter(
      ( value, index, self ) => self.indexOf( value ) === index
    )
  )
  .then( related => related.map( sub => Sign( sub ) ) )
  .then( signs => positionSigns( signs, x, z ) )
  .then( signs => signs.map( sign => {

    sign.position.y = -3;
    return sign;

  }))
  .then( signs => signs.map( sign => world.add( sign ) ) )

const subs = [ "aww", "pics", "funny", "mildlyinteresting" ];

loadSub(subs[ Math.random() * subs.length | 0 ]);

export default {
  loadSub,
  mesh: world
};
