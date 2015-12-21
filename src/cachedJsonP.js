import jsonp from "jsonp";

const cachedJsonP = ( url, params, cb ) => {

  const key = "_jpcache";
  // localStorage.removeItem( key );
  const cache = JSON.parse( localStorage.getItem( key ) || "{}" );

  // Remove old cached values
  Object.keys( cache ).forEach( function ( key ) {

    const deets = cache[ key ];

    if ( Date.now() - deets.time > 1000 * 60 * 10 ) {

      console.log( "Removed from cache: ", key );
      delete cache[ key ];

    }

  });

  const cachedData = cache[ url ];

  if ( cachedData ) {

    console.log( url, " already in the cache.", cachedData );
    cb( null, cachedData.data );
    return;

  }

  jsonp( url, params, ( err, data ) => {

    if ( data ) {

      console.log( "Adding to cache", url );

      cache[ url ] = {
        time: Date.now(),
        data: data
      };

      localStorage.setItem( key, JSON.stringify( cache ) );

    }

    cb(err, data);

  });

};

export default cachedJsonP;
