import RedditAPI from "../RedditAPI";
import SkyBox from "./SkyBox";
import ground from "./ground";
import Sign from "./Sign";
import Instructions from "./Instructions";
import Link from "./Link";

const world = new THREE.Group();
world.add( SkyBox() );
world.add( ground );

const ob = Instructions();
ob.position.set( -20, 0, 15 );
ob.rotation.y = Math.PI + Math.PI / 4;
world.add( ob );

const positionSigns = ( signs, pos = { x: 0, y: 0, z: 0 }, rot ) => {

  const placer = new THREE.Object3D();
  placer.position.copy( pos );
  placer.rotation.y = rot !== undefined ? rot : Math.random() * (2 * Math.PI);

  const off = Math.random() * 2 - 1;
  const dir = Math.random() < 0.5 ? Math.sin : Math.cos
  const dist = (Math.random() * 13 | 0) + 5;

  return signs.map ( ( sign, i ) => {

    sign.rotation.y = placer.rotation.y + ( ( i % 2 === 0 ? -1 : 1 ) * Math.PI / 2 );
    sign.position.copy( placer.position );
    sign.translateZ( -9 ); // Corridor width

    placer.translateX( dir( (off + i) / dist ) * 0.7 );
    placer.translateZ( 3.5 );

    return sign;

  });

}

const loadSub = ( subReddit ) => RedditAPI
  .load( subReddit )
  .then( posts => posts.map(
    ({ data: { title, url } }) => Sign( title, url )
  ) );

const findRelatedSubs = ( subReddit ) => RedditAPI
  .loadAboutSub( subReddit )
  .then( about => about.description
    .match( /\/r\/[a-zA-Z_]+/g )
    .map( sub => sub.toLowerCase() )
    .filter( ( value, index, self ) => self.indexOf( value ) === index )
  )
  .then( related => related.map( sub => Link( sub ) ) )

const load = ( subReddit, pos, rot ) => {
  return Promise.all([
    loadSub( subReddit ),
    findRelatedSubs( subReddit )
  ])
  .then( ([ posts, links ]) => posts.concat( links ).sort( () => Math.random() < 0.5 ) )
  .then( signs => positionSigns( signs, pos, rot ) )
  .then( signs => signs.map( sign => {

    world.add( sign );
    return sign;

  } ) );
}

export default {
  load,
  mesh: world
};
