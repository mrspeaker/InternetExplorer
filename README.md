# Worldt

Reddit ImgUr World, made for the Oculus Rift. You can use it in a normal ol' browser, but it doesn't feel like you're browsing the future: so go get a Rift and a browser with VR support - see [MozVR.com](http://www.mozvr.com).

**Controls:**

Type "/" to enter text mode. Type a subreddit and hit enter, it will load any imgurls.

    WSAD: Move
    Arrows: Rotate
    Q/E: Up 'n down
    Space: Remove an obelisk.
    Enter: When you are looking at a "/r/<subreddit>" obelisk, loads the subreddit.
    Z: reset sensor.

![reddit](https://cloud.githubusercontent.com/assets/129330/6380386/3bd59478-bd07-11e4-9e75-1526cd6aa7a0.png)


## Notes

The code uses a bunch of ES6 stuff: I'm using [jspm.io](http://jspm.io/) for building.

The base code (things in /lib: VRManager, VREffect etc) is from the [Sechelt demo](https://github.com/MozVR/sechelt)
