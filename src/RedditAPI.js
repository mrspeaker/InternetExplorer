import jsonp from "./cachedJsonP";

class RedditAPI {

  redditURL ( subReddit = "perfectloops" ) {

    return `http://www.reddit.com/r/${subReddit}/.json?&t=all&jsonp=callbackFunction`;

  }

  load ( subReddit ) {

    return new Promise( ( resolve, reject ) => {

      jsonp(
        this.redditURL( subReddit ),
        { param: "jsonp" },
        ( err, data ) => {

          err ? reject (err) : resolve( data.data.children )

        });

    });

  }

  loadAboutSub ( subReddit ) {

    return new Promise( ( resolve, reject ) => {

      jsonp(
        `http://www.reddit.com/r/${subReddit}/about.json`,
        { param: "jsonp" },
        ( err, data ) => {

          err ? reject (err) : resolve( data.data )

        }
      )

    });

  }

}

export default new RedditAPI();
