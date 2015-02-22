import jsonp from "jsonp";

class RedditAPI {

  redditURL ( subReddit = "perfectloops" ) {

    return `http://www.reddit.com/r/${subReddit}/top.json?sort=hot&t=all&jsonp=callbackFunction`;

  }

  load ( subReddit ) {

    return new Promise( ( resolve, reject ) => {

      jsonp(
        this.redditURL( subReddit ),
        { param: "jsonp" },
        ( err, data ) => {

          err ? reject( err ) : resolve( data.data.children );

        });

    });

  }

}

export default new RedditAPI();
