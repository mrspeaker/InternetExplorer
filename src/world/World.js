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

  return signs.map ( sign => {
    sign.position.set(
      35 - (Math.random() * 70) + x,
      1,
      35 - (Math.random() * 70) + z
    );

    sign.rotation.y = ( Math.PI / 2 ) + ( Math.random() * Math.PI );

    return sign;

  })

}

const loadSub = ( subReddit, x = 0, z = 0 ) => {

  RedditAPI
    .load( subReddit )
    .then( createSigns )
    .then( signs => positionSigns (signs, x, z) )
    .then( signs => signs.forEach( sign => world.add( sign ) ) );

}

const findRelatedSubs = ( subReddit, x = 0, z = 0 ) => {

  RedditAPI
    .loadAboutSub( subReddit )
    .then( about =>  {
      window.about_data = about;
      const related = about.description
        .match(/\/r\/[a-zA-Z]+/g)
        .map(value => value.toLowerCase())
        .filter(
          (value, index, self) => self.indexOf(value) === index
        );
      return related;
    })
    .then( related => related.map( sub => Sign( sub ) ) )
    .then( signs => positionSigns (signs, x, z) )
    .then( signs => signs.map( sign => {
      sign.position.y = -3;
      return sign;
    }))
    .then( signs => signs.forEach( sign => world.add( sign ) ) )

}

const subs = ["aww", "pics", "funny", "mildlyinteresting", "EarthPorn"];

loadSub(subs[ Math.random() * subs.length | 0 ]);

export default {
  loadSub,
  findRelatedSubs,
  mesh: world
};
