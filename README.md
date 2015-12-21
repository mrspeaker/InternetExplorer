# Internet Explorer

Reddit ImgUr Explorer, made for the Oculus Rift.

[Try it out on the internets](http://mrspeaker.github.io/InternetExplorer/) (really needs VR-enabled browser, but eh...)

Loads subreddit ImgUrl images as a 3d gallery. You can use it in a normal ol' browser, but it doesn't feel like you're browsing the future: so go get a Rift and a browser with VR support - see [MozVR.com](http://www.mozvr.com) or [Chrome builds](http://blog.tojicode.com/2014/07/bringing-vr-to-chrome.html).

**Controls:**

    / to enter typing mode. Type a subreddit and hit enter.
    WSAD: Move
    Arrows: Rotate
    Q/E: Up 'n down
    Space: Remove an obelisk.
    Enter: When you are looking at a "/r/<subreddit>" obelisk, loads the subreddit.
    Z: reset VR sensor.

![redditbeach](https://cloud.githubusercontent.com/assets/129330/6426318/a8bcecd6-bf22-11e4-8855-a6369447ef42.jpg)
![redditbeach2](https://cloud.githubusercontent.com/assets/129330/6426319/aa3b058e-bf22-11e4-838a-bbd2f7681e4f.jpg)

## Notes

  * To set up: `npm install`
  * To run: `npm start`. Browse at `http://localhost:9966`.
  * The base code (things in /lib: VRManager, VREffect etc) is from the [Sechelt demo](https://github.com/MozVR/sechelt)
  * If data isn't loading, make sure you aren't ad-blocking reddit.

## Todos

  * making shadows
  * handle imgur galleries
  * stagger image loading (tonnes of requests is slow in firefox)
  * non-square images
  * downscale big images (not even needed for Oculus rez)
  * minecraft-style double-tap-to-run
