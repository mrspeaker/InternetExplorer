import jsonp from "jsonp";

class RedditAPI {

  redditURL ( subReddit = "perfectloops" ) {

    return `http://www.reddit.com/r/${subReddit}/.json?&t=all&jsonp=callbackFunction`;

  }

  load ( subReddit ) {

    const key = "redditCache";

    // localStorage.removeItem( key );
    const cache = JSON.parse( localStorage.getItem( key ) || "{}" );

    // Remove old cached values
    Object.keys(cache).forEach(function (key) {
      const deets = cache[key];
      console.log(key, Date.now() - deets.time);
      if (Date.now() - deets.time > 1000 * 60 * 10) {
        delete cache[key];
      }
    });

    return new Promise( ( resolve, reject ) => {

      const cachedData = cache[ subReddit ];

      if ( cachedData ) {

        console.log(subReddit, "in the cache");
        return resolve( cachedData.data );

      }

      jsonp(
        this.redditURL( subReddit ),
        { param: "jsonp" },
        ( err, data ) => {

          if ( err ) {

            reject (err);

          } else {

            cache[ subReddit ] = {
              time: Date.now(),
              data: data.data.children
            };
            localStorage.setItem( key, JSON.stringify( cache ) );

            resolve( data.data.children )

          }

        });

    });

  }

}

export default new RedditAPI();
