import jsonp from "jsonp";

class RedditAPI {

  redditURL ( subReddit = "perfectloops" ) {

    return `http://www.reddit.com/r/${subReddit}/top.json?sort=hot&t=all&jsonp=callbackFunction`;

  }

  load ( subReddit ) {

    const key = "redditCache";

    // localStorage.removeItem( key );
    const cache = JSON.parse( localStorage.getItem( key ) || "{}" );

    return new Promise( ( resolve, reject ) => {

      const cachedData = cache[ subReddit ];

      if ( cachedData && Date.now() - cachedData.time < 1000 * 60 * 5 ) {

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
