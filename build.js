(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _main = require("./src/main");

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _main2.default;

},{"./src/main":13}],2:[function(require,module,exports){
/**
 * Module dependencies
 */

var debug = require('debug')('jsonp');

/**
 * Module exports.
 */

module.exports = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (count++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    if (script.parentNode) script.parentNode.removeChild(script);
    window[id] = noop;
    if (timer) clearTimeout(timer);
  }

  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    debug('jsonp got', data);
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);

  return cancel;
}

},{"debug":3}],3:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":4}],4:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":5}],5:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],6:[function(require,module,exports){
// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);

},{}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeyboardControls = (function () {
  function KeyboardControls() {
    _classCallCheck(this, KeyboardControls);

    this._keys = {};

    document.body.addEventListener("keydown", this._onDown.bind(this), false);
    document.body.addEventListener("keyup", this._onUp.bind(this), false);
  }

  _createClass(KeyboardControls, [{
    key: "_onDown",
    value: function _onDown(e) {

      if ([37, 38, 39, 40].indexOf(e.which) >= 0) {

        e.preventDefault();
      }
      this._keys[e.which] = 1;
    }
  }, {
    key: "_onUp",
    value: function _onUp(e) {

      this._keys[e.which] = 0;
    }
  }, {
    key: "action",
    value: function action(release) {

      if (release) {

        this._keys[32] = false;
        return;
      }

      return this._keys[32];
    }
  }, {
    key: "enter",
    value: function enter(release) {

      if (release) {

        this._keys[13] = false;
        return;
      }

      return this._keys[13];
    }
  }, {
    key: "zero",
    value: function zero() {

      return this._keys[90];
    }
  }, {
    key: "rot",
    value: function rot() {

      var left = this._keys[37] ? 1 : 0;
      var right = this._keys[39] ? 1 : 0;
      return -left + right;
    }
  }, {
    key: "vert",
    value: function vert() {

      var up = this._keys[81] ? 1 : 0;
      var down = this._keys[69] ? 1 : 0;
      return -up + down;
    }
  }, {
    key: "x",
    value: function x() {

      var left = this._keys[65] ? 1 : 0;
      var right = this._keys[68] ? 1 : 0;
      return -left + right;
    }
  }, {
    key: "y",
    value: function y() {

      var up = this._keys[87] ? 1 : 0;
      var down = this._keys[83] ? 1 : 0;
      return -up + down;
    }
  }]);

  return KeyboardControls;
})();

exports.default = KeyboardControls;

},{}],8:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeyboardFieldInput = (function () {
  function KeyboardFieldInput(progressCb) {
    _classCallCheck(this, KeyboardFieldInput);

    this.phrase = "";
    this.collecting = false;

    this.progressCb = progressCb;

    document.addEventListener("keydown", this.onDown.bind(this), false);
  }

  _createClass(KeyboardFieldInput, [{
    key: "_done",
    value: function _done(blnWithWord) {

      this.collecting = false;
      this.progressCb(blnWithWord ? this.phrase : undefined, true);
      this.phrase = "";
    }
  }, {
    key: "onDown",
    value: function onDown(e) {

      if (e.keyCode === 191) {

        e.preventDefault();

        if (this.collecting) {

          this._done(false);
        } else {

          this.phrase = "";
          this.collecting = true;
          this.progressCb(this.phrase, false);
        }

        return;
      }

      if (!this.collecting) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (e.keyCode === 13) {

        this._done(true);
      } else {

        if (e.keyCode === /* delete */8) {
          this.phrase = this.phrase.slice(0, -1);
        } else {

          var ch = String.fromCharCode(e.keyCode).toLowerCase();

          if (e.keyCode === /* dash */173) {
            ch = "_";
          }

          if (ch.match(/[a-zA-Z_]+$/g)) {
            this.phrase += ch;
          }
        }
        this.progressCb(this.phrase, false);
      }
    }
  }]);

  return KeyboardFieldInput;
})();

exports.default = KeyboardFieldInput;

},{}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cachedJsonP = require("./cachedJsonP");

var _cachedJsonP2 = _interopRequireDefault(_cachedJsonP);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RedditAPI = (function () {
  function RedditAPI() {
    _classCallCheck(this, RedditAPI);
  }

  _createClass(RedditAPI, [{
    key: "redditURL",
    value: function redditURL() {
      var subReddit = arguments.length <= 0 || arguments[0] === undefined ? "perfectloops" : arguments[0];

      return "http://www.reddit.com/r/" + subReddit + "/.json?&t=all&jsonp=callbackFunction";
    }
  }, {
    key: "load",
    value: function load(subReddit) {
      var _this = this;

      console.log("subre", this.redditURL(subReddit));

      return new Promise(function (resolve, reject) {

        (0, _cachedJsonP2.default)(_this.redditURL(subReddit), { param: "jsonp" }, function (err, data) {
          console.log("in thi herere", err);
          err ? reject(err) : resolve(data.data.children);
        });
      });
    }
  }, {
    key: "loadAboutSub",
    value: function loadAboutSub(subReddit) {

      return new Promise(function (resolve, reject) {

        (0, _cachedJsonP2.default)("http://www.reddit.com/r/" + subReddit + "/about.json", { param: "jsonp" }, function (err, data) {

          err ? reject(err) : resolve(data.data);
        });
      });
    }
  }]);

  return RedditAPI;
})();

exports.default = new RedditAPI();

},{"./cachedJsonP":11}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createCanvasPlane = require("./createCanvasPlane");

var _createCanvasPlane2 = _interopRequireDefault(_createCanvasPlane);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TextLinePlane = function TextLinePlane(text) {
  return (0, _createCanvasPlane2.default)(256, 60, function (ctx, w, h) {

    ctx.textAlign = "center";
    ctx.fillStyle = "#113";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "22pt Helvetica";
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillText(text, w / 2, 35);
  });
};

exports.default = TextLinePlane;

},{"./createCanvasPlane":12}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonp = require("jsonp");

var _jsonp2 = _interopRequireDefault(_jsonp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cachedJsonP = function cachedJsonP(url, params, cb) {

  var key = "_jpcache";
  // localStorage.removeItem( key );
  var cache = JSON.parse(localStorage.getItem(key) || "{}");

  // Remove old cached values
  Object.keys(cache).forEach(function (key) {

    var deets = cache[key];

    if (Date.now() - deets.time > 1000 * 60 * 10) {

      console.log("Removed from cache: ", key);
      delete cache[key];
    }
  });

  var cachedData = cache[url];

  if (cachedData) {

    console.log(url, " already in the cache.", cachedData);
    cb(null, cachedData.data);
    return;
  }

  (0, _jsonp2.default)(url, params, function (err, data) {

    if (data) {

      console.log("Adding to cache", url);

      cache[url] = {
        time: Date.now(),
        data: data
      };

      localStorage.setItem(key, JSON.stringify(cache));
    }

    cb(err, data);
  });
};

exports.default = cachedJsonP;

},{"jsonp":2}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createCanvasPlane = function createCanvasPlane(w, h, drawFunc) {

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var scale = 0.01;

  canvas.width = w;
  canvas.height = h;

  drawFunc(ctx, w, h);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true
  });

  var geometry = new THREE.PlaneBufferGeometry(w, h, 1, 1);
  var planeMesh = new THREE.Mesh(geometry, material);

  planeMesh.scale.set(scale, scale, scale);

  return planeMesh;
};

exports.default = createCanvasPlane;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _KeyboardControls = require("./KeyboardControls");

var _KeyboardControls2 = _interopRequireDefault(_KeyboardControls);

var _KeyboardFieldInput = require("./KeyboardFieldInput");

var _KeyboardFieldInput2 = _interopRequireDefault(_KeyboardFieldInput);

var _createCanvasPlane = require("./createCanvasPlane");

var _createCanvasPlane2 = _interopRequireDefault(_createCanvasPlane);

var _TextLinePlane = require("./TextLinePlane");

var _TextLinePlane2 = _interopRequireDefault(_TextLinePlane);

var _World = require("./world/World");

var _World2 = _interopRequireDefault(_World);

var _statsJs = require("stats-js");

var _statsJs2 = _interopRequireDefault(_statsJs);

var _Cloud = require("./world/Cloud");

var _Cloud2 = _interopRequireDefault(_Cloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.debug = false;

var showTypeBox = false;

var moves = {
  vx: 0.0,
  vz: 0.0,
  ax: 0.0,
  az: 0.0,

  vrot: 0.0,
  arot: 0.0,

  power: 0.01,
  rotPower: 0.0015,
  drag: 0.95
};

var keys = new _KeyboardControls2.default();
var field = new _KeyboardFieldInput2.default(function (prog, done) {

  if (done) {

    showTypeBox = false;

    if (!prog) return;

    if (prog === "prod") {

      window.debug = !window.debug;
      return;
    }

    var _dolly$position = dolly.position;
    var x = _dolly$position.x;
    var y = _dolly$position.y;
    var z = _dolly$position.z;

    _World2.default.load(prog, { x: x, y: y, z: z }, dolly.rotation.y + Math.PI);
  } else {

    showTypeBox = true;
    scene.remove(typeyText);
    typeyText = (0, _TextLinePlane2.default)("/" + (prog ? prog : ""));
    typeyText.scale.set(0.005, 0.005, 0.005);
    scene.add(typeyText);
  }
});

var stats = new _statsJs2.default();
{
  var dom = stats.domElement;
  var style = dom.style;
  stats.setMode(0);
  style.position = "absolute";
  style.left = "0px";
  style.top = "0px";
  document.body.appendChild(dom);
}

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setClearColor(0x222222);
renderer.shadowMapEnabled = true;

document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x103258, 20, 200);

var dolly = new THREE.Group();
dolly.position.set(-15, 0.4, 5);
scene.add(dolly);

// damn you Chrome...
// const clouds = new Array( 100 ).fill( true )
var clouds = new Array(100).join().split(",").map(function () {
  return _Cloud2.default.make({
    x: Math.random() * 1000 - 500,
    y: 40,
    z: Math.random() * 1000 - 500
  });
});

clouds.forEach(function (c) {
  return scene.add(c);
});

var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(0, 1, 0);
dolly.add(camera);
dolly.rotation.y = -Math.PI / 2;

// Effect and Controls for VR, Initialize the WebVR manager
var effect = new THREE.VREffect(renderer);
var controls = new THREE.VRControls(camera);
var manager = new WebVRManager(effect);

// lights
{
  /*
  const amb = new THREE.AmbientLight( 0x222222 );
  scene.add(amb);
   const pointy = new THREE.PointLight( 0xff44ee, 0, 30 );
  pointy.position.set( 0, -2, 0 );
  dolly.add( pointy );
  */

  var hemiLight = new THREE.HemisphereLight(0xFFF5CE, 0xffffff, 0.6);
  hemiLight.position.set(0, 100, 0);
  scene.add(hemiLight);

  var dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 100, 55);
  dirLight.castShadow = true;
  dirLight.shadowCameraVisible = true;

  var d = 100;

  dirLight.shadowCameraFar = 3500;
  //dirLight.shadowBias = -0.001;
  dirLight.shadowCameraRight = d;
  dirLight.shadowCameraLeft = -d;
  dirLight.shadowCameraTop = d;
  dirLight.shadowCameraBottom = -d;
  dirLight.shadowDarkness = 0.3;

  scene.add(dirLight);
}

scene.add(_World2.default.mesh);

requestAnimationFrame(animate);
window.addEventListener("resize", onWindowResize, false);
onWindowResize();

var loadText = (0, _TextLinePlane2.default)("Hit 'enter' to load.");
loadText.position.set(3, -10, 3);
scene.add(loadText);

var typeyText = (0, _TextLinePlane2.default)("/");
scene.add(typeyText);

_World2.default.load(["aww", "pics", "funny", "mildlyinteresting"][Math.random() * 4 | 0], { x: dolly.position.x, y: 0, z: dolly.position.z }, dolly.rotation.y + Math.PI);

dolly.translateZ(20);
dolly.rotation.y -= 0.2;

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {

  stats.begin();

  requestAnimationFrame(animate);

  controls.update();

  // Rotation
  moves.arot = keys.rot() * moves.rotPower;
  moves.vrot += moves.arot;
  moves.vrot *= moves.drag;

  dolly.rotation.y -= moves.vrot;

  // Movement
  moves.ax = keys.x() * moves.power;
  moves.az = keys.y() * moves.power;
  moves.vx += moves.ax;
  moves.vz += moves.az;
  moves.vx *= moves.drag;
  moves.vz *= moves.drag;

  dolly.translateX(moves.vx);
  dolly.translateZ(moves.vz);
  dolly.translateY(keys.vert() * (moves.power * 3.5));

  // Stay above ground
  if (dolly.position.y < 0) dolly.position.y = 0;

  if (keys.zero()) {

    controls.zeroSensor();
  }

  whatAreYouLookingAt();

  if (showTypeBox) {

    typeyText.position.copy(dolly.position);
    typeyText.rotation.copy(dolly.rotation);
    typeyText.translateZ(-2);
    typeyText.translateY(1.5);
  } else {

    typeyText.position.y = -10;
  }

  if (manager.isVRMode()) {

    effect.render(scene, camera);
  } else {

    renderer.render(scene, camera);
  }

  clouds.forEach(function (c) {
    return _Cloud2.default.move(c);
  });

  stats.end();
}

var whatAreYouLookingAt = function whatAreYouLookingAt() {

  var direction = new THREE.Vector3(0, 0, -1).transformDirection(camera.matrixWorld);
  var raycaster = new THREE.Raycaster(dolly.position, direction, 0, 10);
  var intersects = raycaster.intersectObjects(_World2.default.mesh.children, true);

  if (intersects.length) {

    var sign = intersects[0].object.parent;
    if (sign && sign._data) {

      var title = sign._data.title;
      var isSubReddit = title.match(/\/r\/[a-zA-Z_]+$/g);

      sign.scale.x = 1 + (Math.sin(Date.now() / 1000) + 1) * 0.03;

      if (isSubReddit) {

        loadText.position.copy(sign.position);
        loadText.rotation.copy(sign.rotation);
        loadText.translateZ(1);
        loadText.position.y = 3.8;
      }

      if (keys.enter() && isSubReddit) {

        var sub = title.slice(3);
        var _dolly$position2 = dolly.position;
        var x = _dolly$position2.x;
        var z = _dolly$position2.z;

        _World2.default.load(sub, { x: x, y: sign.position.y, z: z }, sign.rotation.y + Math.PI);
        keys.enter(true);

        sign.parent.remove(sign);
        loadText.position.set(3, -10, 3); // Hide loadTExt box
      }

      if (keys.action()) {

        sign.parent.remove(sign);
        keys.action(true);
      }
    }
  } else {

    loadText.position.y = -10;
  }
};

exports.default = {};

},{"./KeyboardControls":7,"./KeyboardFieldInput":8,"./TextLinePlane":10,"./createCanvasPlane":12,"./world/Cloud":14,"./world/World":21,"stats-js":6}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var speed = 0.01;

var material = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

var make = function make(_ref) {
  var x = _ref.x;
  var y = _ref.y;
  var z = _ref.z;

  var geometry = new THREE.BoxGeometry(Math.random() * 30 + 15, 1, Math.random() * 40 + 15);
  var mesh = new THREE.Mesh(geometry, material);

  var posVec3 = new THREE.Vector3(x, y, z);
  mesh.position.copy(posVec3);
  mesh.lookAt(posVec3.add(new THREE.Vector3(0, 0, 1)));

  return mesh;
};

var move = function move(cloud) {

  cloud.translateZ(speed);

  if (cloud.position.z > 1000) {

    cloud.position.z -= 2000;
    cloud.position.x = Math.random() * 500 - 250;
  }
};

exports.default = {
  move: move,
  make: make
};

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ImgUrMesh = function ImgUrMesh() {
  var imgName = arguments.length <= 0 || arguments[0] === undefined ? "dAvWkN8.jpg" : arguments[0];

  THREE.ImageUtils.crossOrigin = "Anonymous";
  var url = imgName.startsWith("http") ? imgName : "http://i.imgur.com/" + imgName;

  var texture = THREE.ImageUtils.loadTexture(url, undefined, function (data) {}, function (err) {

    console.log("Error loading texture:", url, imgName, err);
  });

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  var geometry = new THREE.PlaneBufferGeometry(4, 4);

  return new THREE.Mesh(geometry, material);
};

exports.default = ImgUrMesh;

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createCanvasPlane = require("../createCanvasPlane");

var _createCanvasPlane2 = _interopRequireDefault(_createCanvasPlane);

var _wrapCanvasText = require("../wrapCanvasText");

var _wrapCanvasText2 = _interopRequireDefault(_wrapCanvasText);

var _ImgUrMesh = require("./ImgUrMesh");

var _ImgUrMesh2 = _interopRequireDefault(_ImgUrMesh);

var _Obelisk = require("./Obelisk");

var _Obelisk2 = _interopRequireDefault(_Obelisk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Instructions = function Instructions() {

  var group = new THREE.Group();

  var ob = (0, _Obelisk2.default)(6, 7, 0.5);
  ob.position.set(0, 3.5, 0);
  group.add(ob);

  var text = (0, _createCanvasPlane2.default)(350, 256, function (ctx, w, h) {

    var lineHeight = 35;
    var offset = 0;

    ctx.font = "20pt Helvetica, Arial, Sans-Serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("/ to enter typing mode", 0, offset += lineHeight);
    ctx.fillText("WSAD: Move", 0, offset += lineHeight);
    ctx.fillText("Arrows: Rotate", 0, offset += lineHeight);
    ctx.fillText("Q/E: Up 'n down", 0, offset += lineHeight);
    ctx.fillText("Enter: Load a /r/ obelisk", 0, offset += lineHeight);
    ctx.fillText("Space: Remove an obelisk", 0, offset += lineHeight);
    ctx.fillText("Z: reset VR sensor", 0, offset += lineHeight);
  });
  text.position.set(-0.2, 5.2, 0.28);
  group.add(text);

  var img = (0, _ImgUrMesh2.default)("dAvWkN8.jpg");
  img.position.set(0, 2, 0.29);
  img.scale.y = 0.8;
  group.add(img);

  return group;
};

exports.default = Instructions;

},{"../createCanvasPlane":12,"../wrapCanvasText":23,"./ImgUrMesh":15,"./Obelisk":18}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createCanvasPlane = require("../createCanvasPlane");

var _createCanvasPlane2 = _interopRequireDefault(_createCanvasPlane);

var _wrapCanvasText = require("../wrapCanvasText");

var _wrapCanvasText2 = _interopRequireDefault(_wrapCanvasText);

var _Obelisk = require("./Obelisk");

var _Obelisk2 = _interopRequireDefault(_Obelisk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Link = function Link() {
  var title = arguments.length <= 0 || arguments[0] === undefined ? "title" : arguments[0];
  var url = arguments[1];

  var group = new THREE.Group();

  var ob = (0, _Obelisk2.default)(6, 5, 0.5);
  ob.position.set(0, 2.5, 0);
  group.add(ob);

  var text = (0, _createCanvasPlane2.default)(256, 256, function (ctx, w, h) {

    ctx.font = "22pt Helvetica, Arial, Sans-Serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    (0, _wrapCanvasText2.default)(ctx, title, 0, 30, w, 30);
  });
  text.position.set(0, 1.5, 0.28);
  group.add(text);
  group._data = {
    title: title
  };

  return group;
};

exports.default = Link;

},{"../createCanvasPlane":12,"../wrapCanvasText":23,"./Obelisk":18}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var material = new THREE.MeshPhongMaterial({
  color: 0x222222
});

exports.default = function () {
  var x = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];
  var y = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];
  var z = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var box = new THREE.BoxGeometry(x, y, z);
  var mesh = new THREE.Mesh(box, material);

  mesh.castShadow = true;

  return mesh;
};

},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createCanvasPlane = require("../createCanvasPlane");

var _createCanvasPlane2 = _interopRequireDefault(_createCanvasPlane);

var _wrapCanvasText = require("../wrapCanvasText");

var _wrapCanvasText2 = _interopRequireDefault(_wrapCanvasText);

var _ImgUrMesh = require("./ImgUrMesh");

var _ImgUrMesh2 = _interopRequireDefault(_ImgUrMesh);

var _Obelisk = require("./Obelisk");

var _Obelisk2 = _interopRequireDefault(_Obelisk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Sign = function Sign() {
  var title = arguments.length <= 0 || arguments[0] === undefined ? "title" : arguments[0];
  var url = arguments[1];

  var group = new THREE.Group();

  var ob = (0, _Obelisk2.default)(6, 7, 0.5);
  ob.position.set(0, 3.5, 0);
  group.add(ob);

  var text = (0, _createCanvasPlane2.default)(256, 256, function (ctx, w, h) {

    ctx.font = "22pt Helvetica, Arial, Sans-Serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    (0, _wrapCanvasText2.default)(ctx, title, 0, 30, w, 30);
  });
  text.position.set(0, 5, 0.28);
  group.add(text);
  group._data = {
    title: title
  };

  if (!window.debug && url && url.indexOf("imgur.com") >= 0) {

    if (url.endsWith(".gifv")) {

      url = url.slice(4) + ".gif";
      console.log("Moved .gifv to gif:", url);
    }

    if (!(url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".gif"))) {

      console.log("NOP?", url);
      url += ".jpg";
    }

    if (url.startsWith("http://imgur")) url = "http://i." + url.slice(7);
    if (url.startsWith("https://imgur")) url = "https://i." + url.slice(8);

    var img = (0, _ImgUrMesh2.default)(url);
    img.position.set(0, 2.5, 0.29);
    group.add(img);
  }

  return group;
};

exports.default = Sign;

},{"../createCanvasPlane":12,"../wrapCanvasText":23,"./ImgUrMesh":15,"./Obelisk":18}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var geometry = new THREE.SphereGeometry(10000, 64, 32);
var vertices = geometry.vertices;
var faces = geometry.faces;

var colorTop = new THREE.Color(0x001F4B);
var colorMiddle = new THREE.Color(0x1A3C62);
var colorBottom = new THREE.Color(0x596F87);

for (var i = 0, l = faces.length; i < l; i++) {

  var face = faces[i];

  var vertex1 = vertices[face.a];
  var vertex2 = vertices[face.b];
  var vertex3 = vertices[face.c];

  var color1 = colorMiddle.clone();
  color1.lerp(vertex1.y > 0 ? colorTop : colorBottom, Math.abs(vertex1.y) / 6000);

  var color2 = colorMiddle.clone();
  color2.lerp(vertex2.y > 0 ? colorTop : colorBottom, Math.abs(vertex2.y) / 6000);

  var color3 = colorMiddle.clone();
  color3.lerp(vertex3.y > 0 ? colorTop : colorBottom, Math.abs(vertex3.y) / 6000);

  face.vertexColors.push(color1, color2, color3);
}

var material = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
  side: THREE.BackSide,
  depthWrite: false,
  depthTest: false,
  fog: false
});

exports.default = function () {
  return new THREE.Mesh(geometry, material);
};

},{}],21:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _RedditAPI = require("../RedditAPI");

var _RedditAPI2 = _interopRequireDefault(_RedditAPI);

var _SkyBox = require("./SkyBox");

var _SkyBox2 = _interopRequireDefault(_SkyBox);

var _ground = require("./ground");

var _ground2 = _interopRequireDefault(_ground);

var _Sign = require("./Sign");

var _Sign2 = _interopRequireDefault(_Sign);

var _Instructions = require("./Instructions");

var _Instructions2 = _interopRequireDefault(_Instructions);

var _Link = require("./Link");

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var world = new THREE.Group();
world.add((0, _SkyBox2.default)());
world.add(_ground2.default);

var ob = (0, _Instructions2.default)();
ob.position.set(-20, 0, 15);
ob.rotation.y = Math.PI + Math.PI / 4;
world.add(ob);

var positionSigns = function positionSigns(signs) {
  var pos = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0, z: 0 } : arguments[1];
  var rot = arguments[2];

  var placer = new THREE.Object3D();
  placer.position.copy(pos);
  placer.rotation.y = rot !== undefined ? rot : Math.random() * (2 * Math.PI);

  var off = Math.random() * 2 - 1;
  var dir = Math.random() < 0.5 ? Math.sin : Math.cos;
  var dist = (Math.random() * 13 | 0) + 5;

  return signs.map(function (sign, i) {

    sign.rotation.y = placer.rotation.y + (i % 2 === 0 ? -1 : 1) * Math.PI / 2;
    sign.position.copy(placer.position);
    sign.translateZ(-9); // Corridor width

    placer.translateX(dir((off + i) / dist) * 0.7);
    placer.translateZ(3.5);

    return sign;
  });
};

var loadSub = function loadSub(subReddit) {
  return _RedditAPI2.default.load(subReddit).then(function (posts) {
    return posts.map(function (_ref) {
      var _ref$data = _ref.data;
      var title = _ref$data.title;
      var url = _ref$data.url;
      return (0, _Sign2.default)(title, url);
    });
  });
};

var findRelatedSubs = function findRelatedSubs(subReddit) {
  return _RedditAPI2.default.loadAboutSub(subReddit).then(function (about) {
    return about.description.match(/\/r\/[a-zA-Z_]+/g).map(function (sub) {
      return sub.toLowerCase();
    }).filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  }).then(function (related) {
    return related.map(function (sub) {
      return (0, _Link2.default)(sub);
    });
  });
};

var load = function load(subReddit, pos, rot) {
  return Promise.all([loadSub(subReddit), findRelatedSubs(subReddit)]).then(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2);

    var posts = _ref3[0];
    var links = _ref3[1];
    return posts.concat(links).sort(function () {
      return Math.random() < 0.5;
    });
  }).then(function (signs) {
    return positionSigns(signs, pos, rot);
  }).then(function (signs) {
    return signs.map(function (sign) {

      world.add(sign);
      return sign;
    });
  });
};

exports.default = {
  load: load,
  mesh: world
};

},{"../RedditAPI":9,"./Instructions":16,"./Link":17,"./Sign":19,"./SkyBox":20,"./ground":22}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// floor
var grassTex = THREE.ImageUtils.loadTexture('img/sand.jpg');
grassTex.wrapS = THREE.RepeatWrapping;
grassTex.wrapT = THREE.RepeatWrapping;
grassTex.repeat.x = 2046;
grassTex.repeat.y = 2046;

var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), new THREE.MeshBasicMaterial({ map: grassTex }));

ground.position.y = 0;
ground.rotation.x = -Math.PI / 2;
ground.renderDepth = 2;
ground.receiveShadow = true;

exports.default = ground;

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {

  var drawLine = function drawLine(line, i) {
    return ctx.fillText(line, x, y + i * lineHeight);
  };

  var lines = text.split(" ").reduce(function (ac, word, i) {

    var line = ac.curr + word + " ";
    var overwidth = ctx.measureText(line).width > maxWidth && i > 0;

    return {
      lines: overwidth ? [].concat(_toConsumableArray(ac.lines), [ac.curr]) : ac.lines,
      curr: overwidth ? word + " " : line
    };
  }, { lines: [], curr: "" });

  // Add the final line, and draw them
  [].concat(_toConsumableArray(lines.lines), [lines.curr]).forEach(drawLine);
}

exports.default = wrapText;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9idWRvL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qc29ucC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qc29ucC9ub2RlX21vZHVsZXMvZGVidWcvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9qc29ucC9ub2RlX21vZHVsZXMvZGVidWcvZGVidWcuanMiLCJub2RlX21vZHVsZXMvanNvbnAvbm9kZV9tb2R1bGVzL2RlYnVnL25vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdGF0cy1qcy9idWlsZC9zdGF0cy5taW4uanMiLCJzcmMvS2V5Ym9hcmRDb250cm9scy5qcyIsInNyYy9LZXlib2FyZEZpZWxkSW5wdXQuanMiLCJzcmMvUmVkZGl0QVBJLmpzIiwic3JjL1RleHRMaW5lUGxhbmUuanMiLCJzcmMvY2FjaGVkSnNvblAuanMiLCJzcmMvY3JlYXRlQ2FudmFzUGxhbmUuanMiLCJzcmMvbWFpbi5qcyIsInNyYy93b3JsZC9DbG91ZC5qcyIsInNyYy93b3JsZC9JbWdVck1lc2guanMiLCJzcmMvd29ybGQvSW5zdHJ1Y3Rpb25zLmpzIiwic3JjL3dvcmxkL0xpbmsuanMiLCJzcmMvd29ybGQvT2JlbGlzay5qcyIsInNyYy93b3JsZC9TaWduLmpzIiwic3JjL3dvcmxkL1NreUJveC5qcyIsInNyYy93b3JsZC9Xb3JsZC5qcyIsInNyYy93b3JsZC9ncm91bmQuanMiLCJzcmMvd3JhcENhbnZhc1RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7SUNOTSxnQkFBZ0I7QUFFcEIsV0FGSSxnQkFBZ0IsR0FFTDswQkFGWCxnQkFBZ0I7O0FBSWxCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVoQixZQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztBQUM5RSxZQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztHQUUzRTs7ZUFURyxnQkFBZ0I7OzRCQVdWLENBQUMsRUFBRzs7QUFFWixVQUFLLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFFLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLEVBQUc7O0FBRWhELFNBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztPQUVwQjtBQUNELFVBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUMsQ0FBQztLQUUzQjs7OzBCQUVPLENBQUMsRUFBRzs7QUFFVixVQUFJLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFDLENBQUM7S0FFM0I7OzsyQkFFUSxPQUFPLEVBQUc7O0FBRWpCLFVBQUssT0FBTyxFQUFHOztBQUViLFlBQUksQ0FBQyxLQUFLLENBQUUsRUFBRSxDQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLGVBQU87T0FFUjs7QUFFRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUUsRUFBRSxDQUFFLENBQUM7S0FFekI7OzswQkFFTSxPQUFPLEVBQUU7O0FBRWQsVUFBSyxPQUFPLEVBQUc7O0FBRWIsWUFBSSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsR0FBRyxLQUFLLENBQUM7QUFDekIsZUFBTztPQUVSOztBQUVELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsQ0FBQztLQUV6Qjs7OzJCQUVPOztBQUVOLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsQ0FBQztLQUV6Qjs7OzBCQUVNOztBQUVMLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsYUFBTyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7S0FFdEI7OzsyQkFFTzs7QUFFTixVQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEMsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLGFBQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0tBRW5COzs7d0JBRUk7O0FBRUgsVUFBTSxJQUFJLEdBQUcsQUFBRSxJQUFJLENBQUMsS0FBSyxDQUFFLEVBQUUsQ0FBRSxHQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUMsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLGFBQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBRXRCOzs7d0JBRUk7O0FBRUgsVUFBTSxFQUFFLEdBQUcsQUFBRSxJQUFJLENBQUMsS0FBSyxDQUFFLEVBQUUsQ0FBRSxHQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLGFBQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0tBRW5COzs7U0ExRkcsZ0JBQWdCOzs7a0JBNkZQLGdCQUFnQjs7Ozs7Ozs7Ozs7OztJQzdGekIsa0JBQWtCO0FBRXRCLFdBRkksa0JBQWtCLENBRVIsVUFBVSxFQUFHOzBCQUZ2QixrQkFBa0I7O0FBSXBCLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDOztBQUV4QixRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzs7QUFFN0IsWUFBUSxDQUFDLGdCQUFnQixDQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztHQUV6RTs7ZUFYRyxrQkFBa0I7OzBCQWFkLFdBQVcsRUFBRzs7QUFFcEIsVUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDeEIsVUFBSSxDQUFDLFVBQVUsQ0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFFLENBQUM7QUFDaEUsVUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7S0FFbEI7OzsyQkFFUSxDQUFDLEVBQUc7O0FBRVgsVUFBSyxDQUFDLENBQUMsT0FBTyxLQUFLLEdBQUcsRUFBRzs7QUFFdkIsU0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUVuQixZQUFLLElBQUksQ0FBQyxVQUFVLEVBQUc7O0FBRXJCLGNBQUksQ0FBQyxLQUFLLENBQUUsS0FBSyxDQUFFLENBQUM7U0FFckIsTUFBTTs7QUFFTCxjQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixjQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixjQUFJLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFFLENBQUM7U0FFdkM7O0FBRUQsZUFBTztPQUVSOztBQUVELFVBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFHO0FBQ3RCLGVBQU87T0FDUjs7QUFFRCxPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsT0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUVwQixVQUFLLENBQUMsQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFHOztBQUV0QixZQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxDQUFDO09BRXBCLE1BRUk7O0FBRUgsWUFBSSxDQUFDLENBQUMsT0FBTyxpQkFBa0IsQ0FBQyxFQUFFO0FBQ2hDLGNBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDeEMsTUFBTTs7QUFFTCxjQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFFLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFeEQsY0FBSSxDQUFDLENBQUMsT0FBTyxlQUFnQixHQUFHLEVBQUU7QUFDaEMsY0FBRSxHQUFHLEdBQUcsQ0FBQztXQUNWOztBQUVELGNBQUksRUFBRSxDQUFDLEtBQUssQ0FBRSxjQUFjLENBQUUsRUFBRztBQUMvQixnQkFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7V0FDbkI7U0FDRjtBQUNELFlBQUksQ0FBQyxVQUFVLENBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUUsQ0FBQztPQUV2QztLQUVGOzs7U0E1RUcsa0JBQWtCOzs7a0JBZ0ZULGtCQUFrQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQzlFM0IsU0FBUztXQUFULFNBQVM7MEJBQVQsU0FBUzs7O2VBQVQsU0FBUzs7Z0NBRTRCO1VBQTdCLFNBQVMseURBQUcsY0FBYzs7QUFFcEMsMENBQWtDLFNBQVMsMENBQXVDO0tBRW5GOzs7eUJBRU0sU0FBUyxFQUFHOzs7QUFFakIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxTQUFTLENBQUUsQ0FBQyxDQUFBOztBQUVqRCxhQUFPLElBQUksT0FBTyxDQUFFLFVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBTTs7QUFFekMsbUNBQ0UsTUFBSyxTQUFTLENBQUUsU0FBUyxDQUFFLEVBQzNCLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUNsQixVQUFFLEdBQUcsRUFBRSxJQUFJLEVBQU07QUFDZixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDakMsYUFBRyxHQUFHLE1BQU0sQ0FBRyxHQUFHLENBQUUsR0FBRyxPQUFPLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQTtTQUNyRCxDQUFDLENBQUM7T0FFTixDQUFDLENBQUM7S0FFSjs7O2lDQUVjLFNBQVMsRUFBRzs7QUFFekIsYUFBTyxJQUFJLE9BQU8sQ0FBRSxVQUFFLE9BQU8sRUFBRSxNQUFNLEVBQU07O0FBRXpDLGdFQUM2QixTQUFTLGtCQUNwQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFDbEIsVUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFNOztBQUVmLGFBQUcsR0FBRyxNQUFNLENBQUcsR0FBRyxDQUFFLEdBQUcsT0FBTyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQTtTQUU1QyxDQUNGLENBQUE7T0FFRixDQUFDLENBQUM7S0FFSjs7O1NBMUNHLFNBQVM7OztrQkE4Q0EsSUFBSSxTQUFTLEVBQUU7Ozs7Ozs7Ozs7Ozs7OztBQzlDOUIsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFHLElBQUk7U0FBSSxpQ0FBbUIsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFNOztBQUV6RSxPQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUN6QixPQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUN2QixPQUFHLENBQUMsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzNCLE9BQUcsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7QUFDNUIsT0FBRyxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztBQUNyQyxPQUFHLENBQUMsUUFBUSxDQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFDO0dBRWpDLENBQUM7Q0FBQSxDQUFDOztrQkFFWSxhQUFhOzs7Ozs7Ozs7Ozs7Ozs7QUNYNUIsSUFBTSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUssR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQU07O0FBRXpDLE1BQU0sR0FBRyxHQUFHLFVBQVU7O0FBQUMsQUFFdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxZQUFZLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBRSxJQUFJLElBQUksQ0FBRTs7O0FBQUMsQUFHaEUsUUFBTSxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBQyxPQUFPLENBQUUsVUFBVyxHQUFHLEVBQUc7O0FBRTdDLFFBQU0sS0FBSyxHQUFHLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQzs7QUFFM0IsUUFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRzs7QUFFOUMsYUFBTyxDQUFDLEdBQUcsQ0FBRSxzQkFBc0IsRUFBRSxHQUFHLENBQUUsQ0FBQztBQUMzQyxhQUFPLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQztLQUVyQjtHQUVGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUUsR0FBRyxDQUFFLENBQUM7O0FBRWhDLE1BQUssVUFBVSxFQUFHOztBQUVoQixXQUFPLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxVQUFVLENBQUUsQ0FBQztBQUN6RCxNQUFFLENBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQztBQUM1QixXQUFPO0dBRVI7O0FBRUQsdUJBQU8sR0FBRyxFQUFFLE1BQU0sRUFBRSxVQUFFLEdBQUcsRUFBRSxJQUFJLEVBQU07O0FBRW5DLFFBQUssSUFBSSxFQUFHOztBQUVWLGFBQU8sQ0FBQyxHQUFHLENBQUUsaUJBQWlCLEVBQUUsR0FBRyxDQUFFLENBQUM7O0FBRXRDLFdBQUssQ0FBRSxHQUFHLENBQUUsR0FBRztBQUNiLFlBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFlBQUksRUFBRSxJQUFJO09BQ1gsQ0FBQzs7QUFFRixrQkFBWSxDQUFDLE9BQU8sQ0FBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLENBQUUsQ0FBRSxDQUFDO0tBRXREOztBQUVELE1BQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FFZixDQUFDLENBQUM7Q0FFSixDQUFDOztrQkFFYSxXQUFXOzs7Ozs7OztBQ3JEMUIsSUFBTSxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsQ0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRzs7QUFFcEQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBRSxRQUFRLENBQUUsQ0FBQztBQUNsRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFbkIsUUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWxCLFVBQVEsQ0FBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDOztBQUV0QixNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUM7QUFDNUMsU0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0FBRTNCLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDO0FBQzNDLE9BQUcsRUFBRSxPQUFPO0FBQ1osUUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO0FBQ3RCLGVBQVcsRUFBRSxJQUFJO0dBQ2xCLENBQUMsQ0FBQzs7QUFFSCxNQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztBQUM3RCxNQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBRSxDQUFDOztBQUV2RCxXQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBRSxDQUFDOztBQUUzQyxTQUFPLFNBQVMsQ0FBQztDQUVsQixDQUFDOztrQkFFYSxpQkFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JCaEMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRXJCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQzs7QUFFeEIsSUFBTSxLQUFLLEdBQUc7QUFDWixJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRzs7QUFFUCxNQUFJLEVBQUUsR0FBRztBQUNULE1BQUksRUFBRSxHQUFHOztBQUVULE9BQUssRUFBRSxJQUFJO0FBQ1gsVUFBUSxFQUFFLE1BQU07QUFDaEIsTUFBSSxFQUFFLElBQUk7Q0FDWCxDQUFDOztBQUVGLElBQU0sSUFBSSxHQUFHLGdDQUFzQixDQUFDO0FBQ3BDLElBQU0sS0FBSyxHQUFHLGlDQUF3QixVQUFFLElBQUksRUFBRSxJQUFJLEVBQU07O0FBRXRELE1BQUssSUFBSSxFQUFHOztBQUVWLGVBQVcsR0FBRyxLQUFLLENBQUM7O0FBRXBCLFFBQUssQ0FBQyxJQUFJLEVBQUcsT0FBTzs7QUFFcEIsUUFBSyxJQUFJLEtBQUssTUFBTSxFQUFHOztBQUVyQixZQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM3QixhQUFPO0tBRVI7OzBCQUVtQixLQUFLLENBQUMsUUFBUTtRQUExQixDQUFDLG1CQUFELENBQUM7UUFBRSxDQUFDLG1CQUFELENBQUM7UUFBRSxDQUFDLG1CQUFELENBQUM7O0FBRWYsb0JBQU0sSUFBSSxDQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRCxDQUFDLEVBQUUsQ0FBQyxFQUFELENBQUMsRUFBRSxDQUFDLEVBQUQsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0dBRTdELE1BQU07O0FBRUgsZUFBVyxHQUFHLElBQUksQ0FBQztBQUNuQixTQUFLLENBQUMsTUFBTSxDQUFFLFNBQVMsQ0FBRSxDQUFDO0FBQzFCLGFBQVMsR0FBRyw2QkFBZSxHQUFHLElBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUEsQUFBRSxDQUFDLENBQUM7QUFDdkQsYUFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUUsQ0FBQztBQUMzQyxTQUFLLENBQUMsR0FBRyxDQUFFLFNBQVMsQ0FBRSxDQUFDO0dBRTFCO0NBRUYsQ0FBQyxDQUFDOztBQUVILElBQU0sS0FBSyxHQUFHLHVCQUFXLENBQUM7QUFDMUI7QUFDRSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQzdCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDeEIsT0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUNuQixPQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztBQUM1QixPQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUNuQixPQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUNsQixVQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxHQUFHLENBQUUsQ0FBQztDQUNsQzs7QUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RCxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUMzQixRQUFRLENBQUMsYUFBYSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBQ25DLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O0FBRWpDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUUsQ0FBQzs7QUFFakQsSUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUUsQ0FBQzs7QUFFL0MsSUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDOzs7O0FBQUMsQUFJakIsSUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUUsR0FBRyxDQUFFLENBQzVCLElBQUksRUFBRSxDQUNOLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FDWixHQUFHLENBQUU7U0FBTSxnQkFBTSxJQUFJLENBQUM7QUFDckIsS0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRztBQUM3QixLQUFDLEVBQUUsRUFBRTtBQUNMLEtBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUc7R0FDOUIsQ0FBQztDQUFBLENBQUUsQ0FBQTs7QUFFTixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztTQUFJLEtBQUssQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFFO0NBQUEsQ0FBQyxDQUFDOztBQUVwQyxJQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUUsQ0FBQztBQUNuRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQy9CLEtBQUssQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7QUFDcEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUM7OztBQUFDLEFBR2pDLElBQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBRSxRQUFRLENBQUUsQ0FBQztBQUM5QyxJQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUM7QUFDaEQsSUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFZLENBQUUsTUFBTSxDQUFFOzs7QUFBQyxBQUczQzs7Ozs7Ozs7O0FBVUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFFLENBQUM7QUFDdkUsV0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUUsQ0FBQztBQUNwQyxPQUFLLENBQUMsR0FBRyxDQUFFLFNBQVMsQ0FBRSxDQUFDOztBQUV2QixNQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBRSxRQUFRLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFDM0QsVUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUUsQ0FBQztBQUNwQyxVQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUMzQixVQUFRLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDOztBQUVwQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7O0FBRWQsVUFBUSxDQUFDLGVBQWUsR0FBRyxJQUFJOztBQUFDLEFBRWhDLFVBQVEsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDL0IsVUFBUSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFVBQVEsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFVBQVEsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqQyxVQUFRLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQzs7QUFFOUIsT0FBSyxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUUsQ0FBQztDQUV2Qjs7QUFFRCxLQUFLLENBQUMsR0FBRyxDQUFFLGdCQUFNLElBQUksQ0FBRSxDQUFDOztBQUV4QixxQkFBcUIsQ0FBRSxPQUFPLENBQUUsQ0FBQztBQUNqQyxNQUFNLENBQUMsZ0JBQWdCLENBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUUsQ0FBQztBQUMzRCxjQUFjLEVBQUUsQ0FBQzs7QUFFakIsSUFBTSxRQUFRLEdBQUcsNkJBQWUsc0JBQXNCLENBQUUsQ0FBQztBQUN6RCxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFDbkMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUUsQ0FBQzs7QUFFdEIsSUFBSSxTQUFTLEdBQUcsNkJBQWUsR0FBRyxDQUFFLENBQUM7QUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxTQUFTLENBQUUsQ0FBQzs7QUFFdkIsZ0JBQU0sSUFBSSxDQUNSLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUUsQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUN4RSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUNsRCxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUMzQixDQUFDOztBQUVGLEtBQUssQ0FBQyxVQUFVLENBQUUsRUFBRSxDQUFFLENBQUM7QUFDdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDOztBQUd4QixTQUFTLGNBQWMsR0FBSTs7QUFFekIsUUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDdkQsUUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDaEMsUUFBTSxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUUsQ0FBQztDQUV6RDs7QUFFRCxTQUFTLE9BQU8sQ0FBRyxJQUFJLEVBQUc7O0FBRXhCLE9BQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFZCx1QkFBcUIsQ0FBRSxPQUFPLENBQUUsQ0FBQzs7QUFFakMsVUFBUSxDQUFDLE1BQU0sRUFBRTs7O0FBQUMsQUFHbEIsT0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUN6QyxPQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDekIsT0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDOztBQUV6QixPQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSTs7O0FBQUMsQUFHL0IsT0FBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNsQyxPQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ2xDLE9BQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUNyQixPQUFLLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDckIsT0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLE9BQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQzs7QUFFdkIsT0FBSyxDQUFDLFVBQVUsQ0FBRSxLQUFLLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDN0IsT0FBSyxDQUFDLFVBQVUsQ0FBRSxLQUFLLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDN0IsT0FBSyxDQUFDLFVBQVUsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUEsQUFBQyxDQUFFOzs7QUFBQyxBQUd0RCxNQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRS9DLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRSxFQUFHOztBQUVqQixZQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7R0FFdkI7O0FBRUQscUJBQW1CLEVBQUUsQ0FBQzs7QUFFdEIsTUFBSyxXQUFXLEVBQUc7O0FBRWpCLGFBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBQyxRQUFRLENBQUUsQ0FBQztBQUMxQyxhQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUMsUUFBUSxDQUFFLENBQUM7QUFDMUMsYUFBUyxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUMsQ0FBRSxDQUFDO0FBQzNCLGFBQVMsQ0FBQyxVQUFVLENBQUUsR0FBRyxDQUFFLENBQUM7R0FFN0IsTUFBTTs7QUFFTCxhQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztHQUU1Qjs7QUFFRCxNQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRzs7QUFFeEIsVUFBTSxDQUFDLE1BQU0sQ0FBRSxLQUFLLEVBQUUsTUFBTSxDQUFFLENBQUM7R0FFaEMsTUFBTTs7QUFFTCxZQUFRLENBQUMsTUFBTSxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUUsQ0FBQztHQUVsQzs7QUFFRCxRQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztXQUFJLGdCQUFNLElBQUksQ0FBRSxDQUFDLENBQUU7R0FBQSxDQUFDLENBQUM7O0FBRXJDLE9BQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUViOztBQUVELElBQU0sbUJBQW1CLEdBQUcsU0FBdEIsbUJBQW1CLEdBQVM7O0FBRWhDLE1BQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFLENBQUMsa0JBQWtCLENBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBRSxDQUFDO0FBQ3pGLE1BQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBRSxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFFLENBQUM7QUFDMUUsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFFLGdCQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFFLENBQUM7O0FBRTNFLE1BQUssVUFBVSxDQUFDLE1BQU0sRUFBRzs7QUFFdkIsUUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFFLENBQUMsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDM0MsUUFBSyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRzs7QUFFeEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUE7QUFDOUIsVUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBRSxtQkFBbUIsQ0FBRSxDQUFBOztBQUV0RCxVQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUssQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUUsR0FBRyxDQUFDLENBQUEsR0FBSyxJQUFJLEFBQUUsQ0FBQzs7QUFFcEUsVUFBSyxXQUFXLEVBQUc7O0FBRWpCLGdCQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUM7QUFDeEMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQztBQUN4QyxnQkFBUSxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUN6QixnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO09BRTNCOztBQUVELFVBQUssSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLFdBQVcsRUFBRzs7QUFFakMsWUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQzsrQkFDWixLQUFLLENBQUMsUUFBUTtZQUF2QixDQUFDLG9CQUFELENBQUM7WUFBRSxDQUFDLG9CQUFELENBQUM7O0FBRVosd0JBQU0sSUFBSSxDQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRCxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRCxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDM0UsWUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQzs7QUFFbkIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFFLENBQUM7QUFDM0IsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUU7T0FFbkM7QUFGb0M7QUFJckMsVUFBSyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUc7O0FBRW5CLFlBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQzNCLFlBQUksQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFFLENBQUM7T0FFckI7S0FFRjtHQUVGLE1BQU07O0FBRUwsWUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7R0FFM0I7Q0FFRixDQUFBOztrQkFFYyxFQUFFOzs7Ozs7OztBQ3JTakIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVuQixJQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBRSxDQUFDOztBQUV0RSxJQUFNLElBQUksR0FBRyxTQUFQLElBQUksT0FBc0I7TUFBZixDQUFDLFFBQUQsQ0FBQztNQUFFLENBQUMsUUFBRCxDQUFDO01BQUUsQ0FBQyxRQUFELENBQUM7O0FBRXRCLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQ3ZCLENBQUMsRUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FDMUIsQ0FBQztBQUNGLE1BQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBRSxRQUFRLEVBQUUsUUFBUSxDQUFFLENBQUM7O0FBRWxELE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzdDLE1BQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDO0FBQzlCLE1BQUksQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBRSxDQUFFLENBQUM7O0FBRTNELFNBQU8sSUFBSSxDQUFDO0NBRWIsQ0FBQzs7QUFFRixJQUFNLElBQUksR0FBRyxTQUFQLElBQUksQ0FBSyxLQUFLLEVBQU07O0FBRXhCLE9BQUssQ0FBQyxVQUFVLENBQUUsS0FBSyxDQUFFLENBQUM7O0FBRTFCLE1BQUssS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFHOztBQUU3QixTQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDekIsU0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7R0FFOUM7Q0FFRixDQUFDOztrQkFFYTtBQUNiLE1BQUksRUFBSixJQUFJO0FBQ0osTUFBSSxFQUFKLElBQUk7Q0FDTDs7Ozs7Ozs7QUNyQ0QsSUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLEdBQWtDO01BQTdCLE9BQU8seURBQUcsYUFBYTs7QUFFekMsT0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQzNDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUUsTUFBTSxDQUFFLEdBQUcsT0FBTywyQkFBMEIsT0FBTyxBQUFHLENBQUE7O0FBRXRGLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUFBRSxJQUFJLEVBQU0sRUFBRSxFQUFFLFVBQUUsR0FBRyxFQUFNOztBQUV2RixXQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FFMUQsQ0FBRSxDQUFDOztBQUVKLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDO0FBQzNDLE9BQUcsRUFBRSxPQUFPO0FBQ1osUUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO0dBQ3ZCLENBQUMsQ0FBQztBQUNILE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQzs7QUFFdkQsU0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBRSxDQUFDO0NBRTdDLENBQUE7O2tCQUVjLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hCeEIsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLEdBQVM7O0FBRXpCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVoQyxNQUFNLEVBQUUsR0FBRyx1QkFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBRSxDQUFDO0FBQ2hDLElBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFFLENBQUE7QUFDNUIsT0FBSyxDQUFDLEdBQUcsQ0FBRSxFQUFFLENBQUUsQ0FBQzs7QUFFaEIsTUFBTSxJQUFJLEdBQUcsaUNBQW1CLEdBQUcsRUFBRSxHQUFHLEVBQUUsVUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7QUFFekQsUUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFZixPQUFHLENBQUMsSUFBSSxHQUFHLG1DQUFtQyxDQUFDO0FBQy9DLE9BQUcsQ0FBQyxTQUFTLEdBQUcsMEJBQTBCLENBQUM7QUFDM0MsT0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDO0FBQ2hFLE9BQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxNQUFNLElBQUksVUFBVSxDQUFDLENBQUM7QUFDcEQsT0FBRyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDO0FBQ3hELE9BQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBQztBQUN6RCxPQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLENBQUMsRUFBRSxNQUFNLElBQUksVUFBVSxDQUFDLENBQUM7QUFDbkUsT0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLEVBQUUsTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDO0FBQ2xFLE9BQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLE1BQU0sSUFBSSxVQUFVLENBQUMsQ0FBQztHQUU3RCxDQUFDLENBQUM7QUFDSCxNQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFFLENBQUM7QUFDckMsT0FBSyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQzs7QUFFbEIsTUFBTSxHQUFHLEdBQUcseUJBQVcsYUFBYSxDQUFFLENBQUM7QUFDdkMsS0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUUsQ0FBQztBQUMvQixLQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbEIsT0FBSyxDQUFDLEdBQUcsQ0FBRSxHQUFHLENBQUUsQ0FBQzs7QUFFakIsU0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFBOztrQkFFYyxZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BDM0IsSUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQStCO01BQTFCLEtBQUsseURBQUcsT0FBTztNQUFFLEdBQUc7O0FBRWpDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVoQyxNQUFNLEVBQUUsR0FBRyx1QkFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBRSxDQUFDO0FBQ2hDLElBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFFLENBQUE7QUFDNUIsT0FBSyxDQUFDLEdBQUcsQ0FBRSxFQUFFLENBQUUsQ0FBQzs7QUFFaEIsTUFBTSxJQUFJLEdBQUcsaUNBQW1CLEdBQUcsRUFBRSxHQUFHLEVBQUUsVUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7QUFFekQsT0FBRyxDQUFDLElBQUksR0FBRyxtQ0FBbUMsQ0FBQztBQUMvQyxPQUFHLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDO0FBQzNDLGtDQUFnQixHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFDO0dBRTVDLENBQUMsQ0FBQztBQUNILE1BQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFFLENBQUM7QUFDbEMsT0FBSyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztBQUNsQixPQUFLLENBQUMsS0FBSyxHQUFHO0FBQ1osU0FBSyxFQUFMLEtBQUs7R0FDTixDQUFDOztBQUVGLFNBQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQTs7a0JBRWMsSUFBSTs7Ozs7Ozs7QUM1Qm5CLElBQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDO0FBQzNDLE9BQUssRUFBRSxRQUFRO0NBQ2hCLENBQUMsQ0FBQzs7a0JBRVksWUFBNkI7TUFBM0IsQ0FBQyx5REFBRyxFQUFFO01BQUUsQ0FBQyx5REFBRyxFQUFFO01BQUUsQ0FBQyx5REFBRyxDQUFDOztBQUVwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztBQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBRSxDQUFDOztBQUU3QyxNQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdkIsU0FBTyxJQUFJLENBQUM7Q0FFYjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUkQsSUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQStCO01BQTFCLEtBQUsseURBQUcsT0FBTztNQUFFLEdBQUc7O0FBRWpDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVoQyxNQUFNLEVBQUUsR0FBRyx1QkFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBRSxDQUFDO0FBQ2hDLElBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFFLENBQUE7QUFDNUIsT0FBSyxDQUFDLEdBQUcsQ0FBRSxFQUFFLENBQUUsQ0FBQzs7QUFFaEIsTUFBTSxJQUFJLEdBQUcsaUNBQW1CLEdBQUcsRUFBRSxHQUFHLEVBQUUsVUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBTTs7QUFFekQsT0FBRyxDQUFDLElBQUksR0FBRyxtQ0FBbUMsQ0FBQztBQUMvQyxPQUFHLENBQUMsU0FBUyxHQUFHLDBCQUEwQixDQUFDO0FBQzNDLGtDQUFnQixHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFDO0dBRTVDLENBQUMsQ0FBQztBQUNILE1BQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFFLENBQUM7QUFDaEMsT0FBSyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztBQUNsQixPQUFLLENBQUMsS0FBSyxHQUFHO0FBQ1osU0FBSyxFQUFMLEtBQUs7R0FDTixDQUFDOztBQUVGLE1BQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFFLFdBQVcsQ0FBRSxJQUFJLENBQUMsRUFBRzs7QUFFN0QsUUFBSyxHQUFHLENBQUMsUUFBUSxDQUFFLE9BQU8sQ0FBRSxFQUFHOztBQUU3QixTQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUUsR0FBRyxNQUFNLENBQUM7QUFDOUIsYUFBTyxDQUFDLEdBQUcsQ0FBRSxxQkFBcUIsRUFBRSxHQUFHLENBQUUsQ0FBQztLQUUzQzs7QUFFRCxRQUFLLEVBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUEsQUFBRSxFQUFHOztBQUVoRixhQUFPLENBQUMsR0FBRyxDQUFFLE1BQU0sRUFBRSxHQUFHLENBQUUsQ0FBQTtBQUMxQixTQUFHLElBQUksTUFBTSxDQUFDO0tBRWY7O0FBRUQsUUFBSyxHQUFHLENBQUMsVUFBVSxDQUFFLGNBQWMsQ0FBRSxFQUFHLEdBQUcsR0FBRyxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUMzRSxRQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUUsZUFBZSxDQUFFLEVBQUcsR0FBRyxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBRSxDQUFDOztBQUU3RSxRQUFNLEdBQUcsR0FBRyx5QkFBVyxHQUFHLENBQUUsQ0FBQztBQUM3QixPQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBRSxDQUFDO0FBQ2pDLFNBQUssQ0FBQyxHQUFHLENBQUUsR0FBRyxDQUFFLENBQUM7R0FFbEI7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFBOztrQkFFYyxJQUFJOzs7Ozs7Ozs7QUNyRG5CLElBQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO0FBQzNELElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDbkMsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsSUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBQzdDLElBQU0sV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBRSxRQUFRLENBQUUsQ0FBQztBQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUUsUUFBUSxDQUFFLENBQUM7O0FBRWhELEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUc7O0FBRTlDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQzs7QUFFeEIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFFLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBQztBQUNuQyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBRSxDQUFDO0FBQ25DLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBRSxJQUFJLENBQUMsQ0FBQyxDQUFFLENBQUM7O0FBRW5DLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxRQUFNLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7O0FBRXBGLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxRQUFNLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7O0FBRXBGLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxRQUFNLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7O0FBRXBGLE1BQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFFLENBQUM7Q0FFbEQ7O0FBRUQsSUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUU7QUFDNUMsY0FBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO0FBQ2hDLE1BQUksRUFBRSxLQUFLLENBQUMsUUFBUTtBQUNwQixZQUFVLEVBQUUsS0FBSztBQUNqQixXQUFTLEVBQUUsS0FBSztBQUNoQixLQUFHLEVBQUUsS0FBSztDQUNYLENBQUUsQ0FBQzs7a0JBRVc7U0FBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBRTtDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0J6RCxJQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFFLHVCQUFRLENBQUUsQ0FBQztBQUN0QixLQUFLLENBQUMsR0FBRyxrQkFBVSxDQUFDOztBQUVwQixJQUFNLEVBQUUsR0FBRyw2QkFBYyxDQUFDO0FBQzFCLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUUsQ0FBQztBQUM5QixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLEtBQUssQ0FBQyxHQUFHLENBQUUsRUFBRSxDQUFFLENBQUM7O0FBRWhCLElBQU0sYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBSyxLQUFLLEVBQXVDO01BQXJDLEdBQUcseURBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUFFLEdBQUc7O0FBRTVELE1BQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDLFFBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDO0FBQzVCLFFBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQSxBQUFDLENBQUM7O0FBRTVFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFBO0FBQ3JELE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUM7O0FBRTFDLFNBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBRyxVQUFFLElBQUksRUFBRSxDQUFDLEVBQU07O0FBRWhDLFFBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFLLENBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEFBQUUsQ0FBQztBQUNqRixRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUMsUUFBUSxDQUFFLENBQUM7QUFDdEMsUUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUMsQ0FBRTs7QUFBQyxBQUV0QixVQUFNLENBQUMsVUFBVSxDQUFFLEdBQUcsQ0FBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQztBQUNuRCxVQUFNLENBQUMsVUFBVSxDQUFFLEdBQUcsQ0FBRSxDQUFDOztBQUV6QixXQUFPLElBQUksQ0FBQztHQUViLENBQUMsQ0FBQztDQUVKLENBQUE7O0FBRUQsSUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUssU0FBUztTQUFNLG9CQUM5QixJQUFJLENBQUUsU0FBUyxDQUFFLENBQ2pCLElBQUksQ0FBRSxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsR0FBRyxDQUN2QjsyQkFBRyxJQUFJO1VBQUksS0FBSyxhQUFMLEtBQUs7VUFBRSxHQUFHLGFBQUgsR0FBRzthQUFTLG9CQUFNLEtBQUssRUFBRSxHQUFHLENBQUU7S0FBQSxDQUNqRDtHQUFBLENBQUU7Q0FBQSxDQUFDOztBQUVOLElBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBSyxTQUFTO1NBQU0sb0JBQ3RDLFlBQVksQ0FBRSxTQUFTLENBQUUsQ0FDekIsSUFBSSxDQUFFLFVBQUEsS0FBSztXQUFJLEtBQUssQ0FBQyxXQUFXLENBQzlCLEtBQUssQ0FBRSxrQkFBa0IsQ0FBRSxDQUMzQixHQUFHLENBQUUsVUFBQSxHQUFHO2FBQUksR0FBRyxDQUFDLFdBQVcsRUFBRTtLQUFBLENBQUUsQ0FDL0IsTUFBTSxDQUFFLFVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJO2FBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsS0FBSyxLQUFLO0tBQUEsQ0FBRTtHQUFBLENBQ3JFLENBQ0EsSUFBSSxDQUFFLFVBQUEsT0FBTztXQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUUsVUFBQSxHQUFHO2FBQUksb0JBQU0sR0FBRyxDQUFFO0tBQUEsQ0FBRTtHQUFBLENBQUU7Q0FBQSxDQUFBOztBQUV2RCxJQUFNLElBQUksR0FBRyxTQUFQLElBQUksQ0FBSyxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBTTtBQUN0QyxTQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FDakIsT0FBTyxDQUFFLFNBQVMsQ0FBRSxFQUNwQixlQUFlLENBQUUsU0FBUyxDQUFFLENBQzdCLENBQUMsQ0FDRCxJQUFJLENBQUU7OztRQUFHLEtBQUs7UUFBRSxLQUFLO1dBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBRSxLQUFLLENBQUUsQ0FBQyxJQUFJLENBQUU7YUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRztLQUFBLENBQUU7R0FBQSxDQUFFLENBQ3JGLElBQUksQ0FBRSxVQUFBLEtBQUs7V0FBSSxhQUFhLENBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUU7R0FBQSxDQUFFLENBQ2pELElBQUksQ0FBRSxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsR0FBRyxDQUFFLFVBQUEsSUFBSSxFQUFJOztBQUVqQyxXQUFLLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ2xCLGFBQU8sSUFBSSxDQUFDO0tBRWIsQ0FBRTtHQUFBLENBQUUsQ0FBQztDQUNQLENBQUE7O2tCQUVjO0FBQ2IsTUFBSSxFQUFKLElBQUk7QUFDSixNQUFJLEVBQUUsS0FBSztDQUNaOzs7Ozs7Ozs7QUN6RUQsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUQsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO0FBQ3RDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUN0QyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUV6QixJQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQzNCLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFFLEtBQUssRUFBRSxLQUFLLENBQUUsRUFDN0MsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBRSxDQUFDOztBQUVuRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUN2QixNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzs7a0JBRWIsTUFBTTs7Ozs7Ozs7Ozs7QUNoQnJCLFNBQVMsUUFBUSxDQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFHOztBQUUxRCxNQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBSyxJQUFJLEVBQUUsQ0FBQztXQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUssQ0FBQyxHQUFHLFVBQVUsQUFBRSxDQUFFO0dBQUEsQ0FBQzs7QUFFaEYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUUsVUFBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBSzs7QUFFckQsUUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2xDLFFBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUUsSUFBSSxDQUFFLENBQUMsS0FBSyxHQUFHLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVwRSxXQUFPO0FBQ0wsV0FBSyxFQUFFLFNBQVMsZ0NBQU8sRUFBRSxDQUFDLEtBQUssSUFBRSxFQUFFLENBQUMsSUFBSSxLQUFJLEVBQUUsQ0FBQyxLQUFLO0FBQ3BELFVBQUksRUFBRSxTQUFTLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJO0tBQ3BDLENBQUE7R0FFRixFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7OztBQUFDLEFBRzVCLCtCQUFJLEtBQUssQ0FBQyxLQUFLLElBQUUsS0FBSyxDQUFDLElBQUksR0FBRSxPQUFPLENBQUUsUUFBUSxDQUFFLENBQUM7Q0FFbEQ7O2tCQUVjLFFBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfbWFpbiA9IHJlcXVpcmUoXCIuL3NyYy9tYWluXCIpO1xuXG52YXIgX21haW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IF9tYWluMi5kZWZhdWx0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lKcGJtUmxlQzVxY3lJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYlhYMD0iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdqc29ucCcpO1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ganNvbnA7XG5cbi8qKlxuICogQ2FsbGJhY2sgaW5kZXguXG4gKi9cblxudmFyIGNvdW50ID0gMDtcblxuLyoqXG4gKiBOb29wIGZ1bmN0aW9uLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9XG5cbi8qKlxuICogSlNPTlAgaGFuZGxlclxuICpcbiAqIE9wdGlvbnM6XG4gKiAgLSBwYXJhbSB7U3RyaW5nfSBxcyBwYXJhbWV0ZXIgKGBjYWxsYmFja2ApXG4gKiAgLSBwcmVmaXgge1N0cmluZ30gcXMgcGFyYW1ldGVyIChgX19qcGApXG4gKiAgLSBuYW1lIHtTdHJpbmd9IHFzIHBhcmFtZXRlciAoYHByZWZpeGAgKyBpbmNyKVxuICogIC0gdGltZW91dCB7TnVtYmVyfSBob3cgbG9uZyBhZnRlciBhIHRpbWVvdXQgZXJyb3IgaXMgZW1pdHRlZCAoYDYwMDAwYClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0aW9uYWwgb3B0aW9ucyAvIGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25hbCBjYWxsYmFja1xuICovXG5cbmZ1bmN0aW9uIGpzb25wKHVybCwgb3B0cywgZm4pe1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygb3B0cykge1xuICAgIGZuID0gb3B0cztcbiAgICBvcHRzID0ge307XG4gIH1cbiAgaWYgKCFvcHRzKSBvcHRzID0ge307XG5cbiAgdmFyIHByZWZpeCA9IG9wdHMucHJlZml4IHx8ICdfX2pwJztcblxuICAvLyB1c2UgdGhlIGNhbGxiYWNrIG5hbWUgdGhhdCB3YXMgcGFzc2VkIGlmIG9uZSB3YXMgcHJvdmlkZWQuXG4gIC8vIG90aGVyd2lzZSBnZW5lcmF0ZSBhIHVuaXF1ZSBuYW1lIGJ5IGluY3JlbWVudGluZyBvdXIgY291bnRlci5cbiAgdmFyIGlkID0gb3B0cy5uYW1lIHx8IChwcmVmaXggKyAoY291bnQrKykpO1xuXG4gIHZhciBwYXJhbSA9IG9wdHMucGFyYW0gfHwgJ2NhbGxiYWNrJztcbiAgdmFyIHRpbWVvdXQgPSBudWxsICE9IG9wdHMudGltZW91dCA/IG9wdHMudGltZW91dCA6IDYwMDAwO1xuICB2YXIgZW5jID0gZW5jb2RlVVJJQ29tcG9uZW50O1xuICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdIHx8IGRvY3VtZW50LmhlYWQ7XG4gIHZhciBzY3JpcHQ7XG4gIHZhciB0aW1lcjtcblxuXG4gIGlmICh0aW1lb3V0KSB7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBjbGVhbnVwKCk7XG4gICAgICBpZiAoZm4pIGZuKG5ldyBFcnJvcignVGltZW91dCcpKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKXtcbiAgICBpZiAoc2NyaXB0LnBhcmVudE5vZGUpIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgd2luZG93W2lkXSA9IG5vb3A7XG4gICAgaWYgKHRpbWVyKSBjbGVhclRpbWVvdXQodGltZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCl7XG4gICAgaWYgKHdpbmRvd1tpZF0pIHtcbiAgICAgIGNsZWFudXAoKTtcbiAgICB9XG4gIH1cblxuICB3aW5kb3dbaWRdID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgZGVidWcoJ2pzb25wIGdvdCcsIGRhdGEpO1xuICAgIGNsZWFudXAoKTtcbiAgICBpZiAoZm4pIGZuKG51bGwsIGRhdGEpO1xuICB9O1xuXG4gIC8vIGFkZCBxcyBjb21wb25lbnRcbiAgdXJsICs9ICh+dXJsLmluZGV4T2YoJz8nKSA/ICcmJyA6ICc/JykgKyBwYXJhbSArICc9JyArIGVuYyhpZCk7XG4gIHVybCA9IHVybC5yZXBsYWNlKCc/JicsICc/Jyk7XG5cbiAgZGVidWcoJ2pzb25wIHJlcSBcIiVzXCInLCB1cmwpO1xuXG4gIC8vIGNyZWF0ZSBzY3JpcHRcbiAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHNjcmlwdC5zcmMgPSB1cmw7XG4gIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsIHRhcmdldCk7XG5cbiAgcmV0dXJuIGNhbmNlbDtcbn1cbiIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSB3ZWIgYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbmV4cG9ydHMubG9nID0gbG9nO1xuZXhwb3J0cy5mb3JtYXRBcmdzID0gZm9ybWF0QXJncztcbmV4cG9ydHMuc2F2ZSA9IHNhdmU7XG5leHBvcnRzLmxvYWQgPSBsb2FkO1xuZXhwb3J0cy51c2VDb2xvcnMgPSB1c2VDb2xvcnM7XG5cbi8qKlxuICogVXNlIGNocm9tZS5zdG9yYWdlLmxvY2FsIGlmIHdlIGFyZSBpbiBhbiBhcHBcbiAqL1xuXG52YXIgc3RvcmFnZTtcblxuaWYgKHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUuc3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpXG4gIHN0b3JhZ2UgPSBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcbmVsc2VcbiAgc3RvcmFnZSA9IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIHJldHVybiAoJ1dlYmtpdEFwcGVhcmFuY2UnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSkgfHxcbiAgICAvLyBpcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG4gICAgKHdpbmRvdy5jb25zb2xlICYmIChjb25zb2xlLmZpcmVidWcgfHwgKGNvbnNvbGUuZXhjZXB0aW9uICYmIGNvbnNvbGUudGFibGUpKSkgfHxcbiAgICAvLyBpcyBmaXJlZm94ID49IHYzMT9cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1Rvb2xzL1dlYl9Db25zb2xlI1N0eWxpbmdfbWVzc2FnZXNcbiAgICAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoKSB7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm4gYXJncztcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3MgPSBbYXJnc1swXSwgYywgJ2NvbG9yOiBpbmhlcml0J10uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MsIDEpKTtcblxuICAvLyB0aGUgZmluYWwgXCIlY1wiIGlzIHNvbWV3aGF0IHRyaWNreSwgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvdGhlclxuICAvLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG4gIC8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGFzdEMgPSAwO1xuICBhcmdzWzBdLnJlcGxhY2UoLyVbYS16JV0vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICBpZiAoJyUlJyA9PT0gbWF0Y2gpIHJldHVybjtcbiAgICBpbmRleCsrO1xuICAgIGlmICgnJWMnID09PSBtYXRjaCkge1xuICAgICAgLy8gd2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4gICAgICAvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuICAgICAgbGFzdEMgPSBpbmRleDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyZ3Muc3BsaWNlKGxhc3RDLCAwLCBjKTtcbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdG9yYWdlLmRlYnVnID0gbmFtZXNwYWNlcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cbn1cblxuLyoqXG4gKiBMb2FkIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybnMgdGhlIHByZXZpb3VzbHkgcGVyc2lzdGVkIGRlYnVnIG1vZGVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2FkKCkge1xuICB2YXIgcjtcbiAgdHJ5IHtcbiAgICByID0gc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuICByZXR1cm4gcjtcbn1cblxuLyoqXG4gKiBFbmFibGUgbmFtZXNwYWNlcyBsaXN0ZWQgaW4gYGxvY2FsU3RvcmFnZS5kZWJ1Z2AgaW5pdGlhbGx5LlxuICovXG5cbmV4cG9ydHMuZW5hYmxlKGxvYWQoKSk7XG5cbi8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9jYWxzdG9yYWdlKCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyY2FzZWQgbGV0dGVyLCBpLmUuIFwiblwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi9cblxudmFyIHByZXZDb2xvciA9IDA7XG5cbi8qKlxuICogUHJldmlvdXMgbG9nIHRpbWVzdGFtcC5cbiAqL1xuXG52YXIgcHJldlRpbWU7XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IoKSB7XG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1twcmV2Q29sb3IrKyAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWVzcGFjZSkge1xuXG4gIC8vIGRlZmluZSB0aGUgYGRpc2FibGVkYCB2ZXJzaW9uXG4gIGZ1bmN0aW9uIGRpc2FibGVkKCkge1xuICB9XG4gIGRpc2FibGVkLmVuYWJsZWQgPSBmYWxzZTtcblxuICAvLyBkZWZpbmUgdGhlIGBlbmFibGVkYCB2ZXJzaW9uXG4gIGZ1bmN0aW9uIGVuYWJsZWQoKSB7XG5cbiAgICB2YXIgc2VsZiA9IGVuYWJsZWQ7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIGFkZCB0aGUgYGNvbG9yYCBpZiBub3Qgc2V0XG4gICAgaWYgKG51bGwgPT0gc2VsZi51c2VDb2xvcnMpIHNlbGYudXNlQ29sb3JzID0gZXhwb3J0cy51c2VDb2xvcnMoKTtcbiAgICBpZiAobnVsbCA9PSBzZWxmLmNvbG9yICYmIHNlbGYudXNlQ29sb3JzKSBzZWxmLmNvbG9yID0gc2VsZWN0Q29sb3IoKTtcblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVvXG4gICAgICBhcmdzID0gWyclbyddLmNvbmNhdChhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16JV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmZvcm1hdEFyZ3MpIHtcbiAgICAgIGFyZ3MgPSBleHBvcnRzLmZvcm1hdEFyZ3MuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfVxuICAgIHZhciBsb2dGbiA9IGVuYWJsZWQubG9nIHx8IGV4cG9ydHMubG9nIHx8IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG4gICAgbG9nRm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbiAgZW5hYmxlZC5lbmFibGVkID0gdHJ1ZTtcblxuICB2YXIgZm4gPSBleHBvcnRzLmVuYWJsZWQobmFtZXNwYWNlKSA/IGVuYWJsZWQgOiBkaXNhYmxlZDtcblxuICBmbi5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG5cbiAgcmV0dXJuIGZuO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIHZhciBzcGxpdCA9IChuYW1lc3BhY2VzIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pO1xuICB2YXIgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoIXNwbGl0W2ldKSBjb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3NcbiAgICBuYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csICcuKj8nKTtcbiAgICBpZiAobmFtZXNwYWNlc1swXSA9PT0gJy0nKSB7XG4gICAgICBleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkaXNhYmxlKCkge1xuICBleHBvcnRzLmVuYWJsZSgnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGVkKG5hbWUpIHtcbiAgdmFyIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogSGVscGVycy5cbiAqL1xuXG52YXIgcyA9IDEwMDA7XG52YXIgbSA9IHMgKiA2MDtcbnZhciBoID0gbSAqIDYwO1xudmFyIGQgPSBoICogMjQ7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwsIG9wdGlvbnMpe1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2YWwpIHJldHVybiBwYXJzZSh2YWwpO1xuICByZXR1cm4gb3B0aW9ucy5sb25nXG4gICAgPyBsb25nKHZhbClcbiAgICA6IHNob3J0KHZhbCk7XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpO1xuICBpZiAoIW1hdGNoKSByZXR1cm47XG4gIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeTtcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkO1xuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaDtcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG07XG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzO1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gbjtcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNob3J0KG1zKSB7XG4gIGlmIChtcyA+PSBkKSByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICBpZiAobXMgPj0gaCkgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgaWYgKG1zID49IG0pIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzKSByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9uZyhtcykge1xuICByZXR1cm4gcGx1cmFsKG1zLCBkLCAnZGF5JylcbiAgICB8fCBwbHVyYWwobXMsIGgsICdob3VyJylcbiAgICB8fCBwbHVyYWwobXMsIG0sICdtaW51dGUnKVxuICAgIHx8IHBsdXJhbChtcywgcywgJ3NlY29uZCcpXG4gICAgfHwgbXMgKyAnIG1zJztcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG4sIG5hbWUpIHtcbiAgaWYgKG1zIDwgbikgcmV0dXJuO1xuICBpZiAobXMgPCBuICogMS41KSByZXR1cm4gTWF0aC5mbG9vcihtcyAvIG4pICsgJyAnICsgbmFtZTtcbiAgcmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJztcbn1cbiIsIi8vIHN0YXRzLmpzIC0gaHR0cDovL2dpdGh1Yi5jb20vbXJkb29iL3N0YXRzLmpzXG52YXIgU3RhdHM9ZnVuY3Rpb24oKXt2YXIgbD1EYXRlLm5vdygpLG09bCxnPTAsbj1JbmZpbml0eSxvPTAsaD0wLHA9SW5maW5pdHkscT0wLHI9MCxzPTAsZj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2YuaWQ9XCJzdGF0c1wiO2YuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGIpe2IucHJldmVudERlZmF1bHQoKTt0KCsrcyUyKX0sITEpO2Yuc3R5bGUuY3NzVGV4dD1cIndpZHRoOjgwcHg7b3BhY2l0eTowLjk7Y3Vyc29yOnBvaW50ZXJcIjt2YXIgYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2EuaWQ9XCJmcHNcIjthLnN0eWxlLmNzc1RleHQ9XCJwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMDJcIjtmLmFwcGVuZENoaWxkKGEpO3ZhciBpPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7aS5pZD1cImZwc1RleHRcIjtpLnN0eWxlLmNzc1RleHQ9XCJjb2xvcjojMGZmO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4XCI7XG5pLmlubmVySFRNTD1cIkZQU1wiO2EuYXBwZW5kQ2hpbGQoaSk7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtjLmlkPVwiZnBzR3JhcGhcIjtjLnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmZlwiO2ZvcihhLmFwcGVuZENoaWxkKGMpOzc0PmMuY2hpbGRyZW4ubGVuZ3RoOyl7dmFyIGo9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7ai5zdHlsZS5jc3NUZXh0PVwid2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTEzXCI7Yy5hcHBlbmRDaGlsZChqKX12YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2QuaWQ9XCJtc1wiO2Quc3R5bGUuY3NzVGV4dD1cInBhZGRpbmc6MCAwIDNweCAzcHg7dGV4dC1hbGlnbjpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzAyMDtkaXNwbGF5Om5vbmVcIjtmLmFwcGVuZENoaWxkKGQpO3ZhciBrPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5rLmlkPVwibXNUZXh0XCI7ay5zdHlsZS5jc3NUZXh0PVwiY29sb3I6IzBmMDtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweFwiO2suaW5uZXJIVE1MPVwiTVNcIjtkLmFwcGVuZENoaWxkKGspO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5pZD1cIm1zR3JhcGhcIjtlLnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo3NHB4O2hlaWdodDozMHB4O2JhY2tncm91bmQtY29sb3I6IzBmMFwiO2ZvcihkLmFwcGVuZENoaWxkKGUpOzc0PmUuY2hpbGRyZW4ubGVuZ3RoOylqPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpLGouc3R5bGUuY3NzVGV4dD1cIndpZHRoOjFweDtoZWlnaHQ6MzBweDtmbG9hdDpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzEzMVwiLGUuYXBwZW5kQ2hpbGQoaik7dmFyIHQ9ZnVuY3Rpb24oYil7cz1iO3N3aXRjaChzKXtjYXNlIDA6YS5zdHlsZS5kaXNwbGF5PVxuXCJibG9ja1wiO2Quc3R5bGUuZGlzcGxheT1cIm5vbmVcIjticmVhaztjYXNlIDE6YS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiLGQuc3R5bGUuZGlzcGxheT1cImJsb2NrXCJ9fTtyZXR1cm57UkVWSVNJT046MTIsZG9tRWxlbWVudDpmLHNldE1vZGU6dCxiZWdpbjpmdW5jdGlvbigpe2w9RGF0ZS5ub3coKX0sZW5kOmZ1bmN0aW9uKCl7dmFyIGI9RGF0ZS5ub3coKTtnPWItbDtuPU1hdGgubWluKG4sZyk7bz1NYXRoLm1heChvLGcpO2sudGV4dENvbnRlbnQ9ZytcIiBNUyAoXCIrbitcIi1cIitvK1wiKVwiO3ZhciBhPU1hdGgubWluKDMwLDMwLTMwKihnLzIwMCkpO2UuYXBwZW5kQ2hpbGQoZS5maXJzdENoaWxkKS5zdHlsZS5oZWlnaHQ9YStcInB4XCI7cisrO2I+bSsxRTMmJihoPU1hdGgucm91bmQoMUUzKnIvKGItbSkpLHA9TWF0aC5taW4ocCxoKSxxPU1hdGgubWF4KHEsaCksaS50ZXh0Q29udGVudD1oK1wiIEZQUyAoXCIrcCtcIi1cIitxK1wiKVwiLGE9TWF0aC5taW4oMzAsMzAtMzAqKGgvMTAwKSksYy5hcHBlbmRDaGlsZChjLmZpcnN0Q2hpbGQpLnN0eWxlLmhlaWdodD1cbmErXCJweFwiLG09YixyPTApO3JldHVybiBifSx1cGRhdGU6ZnVuY3Rpb24oKXtsPXRoaXMuZW5kKCl9fX07XCJvYmplY3RcIj09PXR5cGVvZiBtb2R1bGUmJihtb2R1bGUuZXhwb3J0cz1TdGF0cyk7XG4iLCJjbGFzcyBLZXlib2FyZENvbnRyb2xzIHtcblxuICBjb25zdHJ1Y3RvciAoKSB7XG5cbiAgICB0aGlzLl9rZXlzID0ge307XG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoIFwia2V5ZG93blwiLCB0aGlzLl9vbkRvd24uYmluZCggdGhpcyApLCBmYWxzZSApO1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lciggXCJrZXl1cFwiLCB0aGlzLl9vblVwLmJpbmQoIHRoaXMgKSwgZmFsc2UgKTtcblxuICB9XG5cbiAgX29uRG93biAoIGUgKSB7XG5cbiAgICBpZiAoIFsgMzcsIDM4LCAzOSwgNDAgXS5pbmRleE9mKCBlLndoaWNoICkgPj0gMCApIHtcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgfVxuICAgIHRoaXMuX2tleXNbIGUud2hpY2ggXSA9IDE7XG5cbiAgfVxuXG4gIF9vblVwICggZSApIHtcblxuICAgIHRoaXMuX2tleXNbIGUud2hpY2ggXSA9IDA7XG5cbiAgfVxuXG4gIGFjdGlvbiAoIHJlbGVhc2UgKSB7XG5cbiAgICBpZiAoIHJlbGVhc2UgKSB7XG5cbiAgICAgIHRoaXMuX2tleXNbIDMyIF0gPSBmYWxzZTtcbiAgICAgIHJldHVybjtcblxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9rZXlzWyAzMiBdO1xuXG4gIH1cblxuICBlbnRlciAocmVsZWFzZSkge1xuXG4gICAgaWYgKCByZWxlYXNlICkge1xuXG4gICAgICB0aGlzLl9rZXlzWyAxMyBdID0gZmFsc2U7XG4gICAgICByZXR1cm47XG5cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fa2V5c1sgMTMgXTtcblxuICB9XG5cbiAgemVybyAoKSB7XG5cbiAgICByZXR1cm4gdGhpcy5fa2V5c1sgOTAgXTtcblxuICB9XG5cbiAgcm90ICgpIHtcblxuICAgIGNvbnN0IGxlZnQgPSB0aGlzLl9rZXlzWyAzNyBdID8gMSA6IDA7XG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLl9rZXlzWyAzOSBdID8gMSA6IDA7XG4gICAgcmV0dXJuIC1sZWZ0ICsgcmlnaHQ7XG5cbiAgfVxuXG4gIHZlcnQgKCkge1xuXG4gICAgY29uc3QgdXAgPSB0aGlzLl9rZXlzWyA4MSBdID8gMSA6IDA7XG4gICAgY29uc3QgZG93biA9IHRoaXMuX2tleXNbIDY5IF0gPyAxIDogMDtcbiAgICByZXR1cm4gLXVwICsgZG93bjtcblxuICB9XG5cbiAgeCAoKSB7XG5cbiAgICBjb25zdCBsZWZ0ID0gKCB0aGlzLl9rZXlzWyA2NSBdICkgPyAxIDogMDtcbiAgICBjb25zdCByaWdodCA9IHRoaXMuX2tleXNbIDY4IF0gPyAxIDogMDtcbiAgICByZXR1cm4gLWxlZnQgKyByaWdodDtcblxuICB9XG5cbiAgeSAoKSB7XG5cbiAgICBjb25zdCB1cCA9ICggdGhpcy5fa2V5c1sgODcgXSApID8gMSA6IDA7XG4gICAgY29uc3QgZG93biA9IHRoaXMuX2tleXNbIDgzIF0gPyAxIDogMDtcbiAgICByZXR1cm4gLXVwICsgZG93bjtcblxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleWJvYXJkQ29udHJvbHM7XG4iLCJjbGFzcyBLZXlib2FyZEZpZWxkSW5wdXQge1xuXG4gIGNvbnN0cnVjdG9yICggcHJvZ3Jlc3NDYiApIHtcblxuICAgIHRoaXMucGhyYXNlID0gXCJcIjtcbiAgICB0aGlzLmNvbGxlY3RpbmcgPSBmYWxzZTtcblxuICAgIHRoaXMucHJvZ3Jlc3NDYiA9IHByb2dyZXNzQ2I7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImtleWRvd25cIiwgdGhpcy5vbkRvd24uYmluZCggdGhpcyApLCBmYWxzZSApO1xuXG4gIH1cblxuICBfZG9uZSAoIGJsbldpdGhXb3JkICkge1xuXG4gICAgdGhpcy5jb2xsZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcm9ncmVzc0NiICggYmxuV2l0aFdvcmQgPyB0aGlzLnBocmFzZSA6IHVuZGVmaW5lZCwgdHJ1ZSApO1xuICAgIHRoaXMucGhyYXNlID0gXCJcIjtcblxuICB9XG5cbiAgb25Eb3duICggZSApIHtcblxuICAgIGlmICggZS5rZXlDb2RlID09PSAxOTEgKSB7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKCB0aGlzLmNvbGxlY3RpbmcgKSB7XG5cbiAgICAgICAgdGhpcy5fZG9uZSggZmFsc2UgKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0aGlzLnBocmFzZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuY29sbGVjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3NDYiggdGhpcy5waHJhc2UsIGZhbHNlICk7XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgaWYgKCAhdGhpcy5jb2xsZWN0aW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgaWYgKCBlLmtleUNvZGUgPT09IDEzICkge1xuXG4gICAgICB0aGlzLl9kb25lKCB0cnVlICk7XG5cbiAgICB9XG5cbiAgICBlbHNlIHtcblxuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gLyogZGVsZXRlICovIDgpIHtcbiAgICAgICAgdGhpcy5waHJhc2UgPSB0aGlzLnBocmFzZS5zbGljZSgwLCAtMSk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGxldCBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoIGUua2V5Q29kZSApLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gLyogZGFzaCAqLyAxNzMpIHtcbiAgICAgICAgICBjaCA9IFwiX1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoLm1hdGNoKCAvW2EtekEtWl9dKyQvZyApICkge1xuICAgICAgICAgIHRoaXMucGhyYXNlICs9IGNoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnByb2dyZXNzQ2IoIHRoaXMucGhyYXNlLCBmYWxzZSApO1xuXG4gICAgfVxuXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlib2FyZEZpZWxkSW5wdXQ7XG4iLCJpbXBvcnQganNvbnAgZnJvbSBcIi4vY2FjaGVkSnNvblBcIjtcblxuY2xhc3MgUmVkZGl0QVBJIHtcblxuICByZWRkaXRVUkwgKCBzdWJSZWRkaXQgPSBcInBlcmZlY3Rsb29wc1wiICkge1xuXG4gICAgcmV0dXJuIGBodHRwOi8vd3d3LnJlZGRpdC5jb20vci8ke3N1YlJlZGRpdH0vLmpzb24/JnQ9YWxsJmpzb25wPWNhbGxiYWNrRnVuY3Rpb25gO1xuXG4gIH1cblxuICBsb2FkICggc3ViUmVkZGl0ICkge1xuXG4gICAgY29uc29sZS5sb2coXCJzdWJyZVwiLCB0aGlzLnJlZGRpdFVSTCggc3ViUmVkZGl0ICkpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICBqc29ucChcbiAgICAgICAgdGhpcy5yZWRkaXRVUkwoIHN1YlJlZGRpdCApLFxuICAgICAgICB7IHBhcmFtOiBcImpzb25wXCIgfSxcbiAgICAgICAgKCBlcnIsIGRhdGEgKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpbiB0aGkgaGVyZXJlXCIsIGVycilcbiAgICAgICAgICBlcnIgPyByZWplY3QgKCBlcnIgKSA6IHJlc29sdmUoIGRhdGEuZGF0YS5jaGlsZHJlbiApXG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGxvYWRBYm91dFN1YiAoIHN1YlJlZGRpdCApIHtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG5cbiAgICAgIGpzb25wKFxuICAgICAgICBgaHR0cDovL3d3dy5yZWRkaXQuY29tL3IvJHtzdWJSZWRkaXR9L2Fib3V0Lmpzb25gLFxuICAgICAgICB7IHBhcmFtOiBcImpzb25wXCIgfSxcbiAgICAgICAgKCBlcnIsIGRhdGEgKSA9PiB7XG5cbiAgICAgICAgICBlcnIgPyByZWplY3QgKCBlcnIgKSA6IHJlc29sdmUoIGRhdGEuZGF0YSApXG5cbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgfSk7XG5cbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBSZWRkaXRBUEkoKTtcbiIsImltcG9ydCBjcmVhdGVDYW52YXNQbGFuZSBmcm9tIFwiLi9jcmVhdGVDYW52YXNQbGFuZVwiO1xuXG5jb25zdCBUZXh0TGluZVBsYW5lID0gdGV4dCA9PiBjcmVhdGVDYW52YXNQbGFuZSggMjU2LCA2MCwgKCBjdHgsIHcsIGggKSA9PiB7XG5cbiAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG4gIGN0eC5maWxsU3R5bGUgPSBcIiMxMTNcIjtcbiAgY3R4LmZpbGxSZWN0KCAwLCAwLCB3LCBoICk7XG4gIGN0eC5mb250ID0gXCIyMnB0IEhlbHZldGljYVwiO1xuICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIjtcbiAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB3IC8gMiwgMzUgKTtcblxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRMaW5lUGxhbmU7XG4iLCJpbXBvcnQganNvbnAgZnJvbSBcImpzb25wXCI7XG5cbmNvbnN0IGNhY2hlZEpzb25QID0gKCB1cmwsIHBhcmFtcywgY2IgKSA9PiB7XG5cbiAgY29uc3Qga2V5ID0gXCJfanBjYWNoZVwiO1xuICAvLyBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgga2V5ICk7XG4gIGNvbnN0IGNhY2hlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oIGtleSApIHx8IFwie31cIiApO1xuXG4gIC8vIFJlbW92ZSBvbGQgY2FjaGVkIHZhbHVlc1xuICBPYmplY3Qua2V5cyggY2FjaGUgKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcblxuICAgIGNvbnN0IGRlZXRzID0gY2FjaGVbIGtleSBdO1xuXG4gICAgaWYgKCBEYXRlLm5vdygpIC0gZGVldHMudGltZSA+IDEwMDAgKiA2MCAqIDEwICkge1xuXG4gICAgICBjb25zb2xlLmxvZyggXCJSZW1vdmVkIGZyb20gY2FjaGU6IFwiLCBrZXkgKTtcbiAgICAgIGRlbGV0ZSBjYWNoZVsga2V5IF07XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgY29uc3QgY2FjaGVkRGF0YSA9IGNhY2hlWyB1cmwgXTtcblxuICBpZiAoIGNhY2hlZERhdGEgKSB7XG5cbiAgICBjb25zb2xlLmxvZyggdXJsLCBcIiBhbHJlYWR5IGluIHRoZSBjYWNoZS5cIiwgY2FjaGVkRGF0YSApO1xuICAgIGNiKCBudWxsLCBjYWNoZWREYXRhLmRhdGEgKTtcbiAgICByZXR1cm47XG5cbiAgfVxuXG4gIGpzb25wKCB1cmwsIHBhcmFtcywgKCBlcnIsIGRhdGEgKSA9PiB7XG5cbiAgICBpZiAoIGRhdGEgKSB7XG5cbiAgICAgIGNvbnNvbGUubG9nKCBcIkFkZGluZyB0byBjYWNoZVwiLCB1cmwgKTtcblxuICAgICAgY2FjaGVbIHVybCBdID0ge1xuICAgICAgICB0aW1lOiBEYXRlLm5vdygpLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9O1xuXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgga2V5LCBKU09OLnN0cmluZ2lmeSggY2FjaGUgKSApO1xuXG4gICAgfVxuXG4gICAgY2IoZXJyLCBkYXRhKTtcblxuICB9KTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVkSnNvblA7XG4iLCJjb25zdCBjcmVhdGVDYW52YXNQbGFuZSA9IGZ1bmN0aW9uICggdywgaCwgZHJhd0Z1bmMgKSB7XG5cbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJjYW52YXNcIiApO1xuICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCggXCIyZFwiICk7XG4gIGNvbnN0IHNjYWxlID0gMC4wMTtcblxuICBjYW52YXMud2lkdGggPSB3O1xuICBjYW52YXMuaGVpZ2h0ID0gaDtcblxuICBkcmF3RnVuYyggY3R4LCB3LCBoICk7XG5cbiAgY29uc3QgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKCBjYW52YXMgKTtcbiAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIG1hcDogdGV4dHVyZSxcbiAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gIH0pO1xuXG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoIHcsIGgsIDEsIDEgKTtcbiAgY29uc3QgcGxhbmVNZXNoID0gbmV3IFRIUkVFLk1lc2goIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuXG4gIHBsYW5lTWVzaC5zY2FsZS5zZXQoIHNjYWxlLCBzY2FsZSwgc2NhbGUgKTtcblxuICByZXR1cm4gcGxhbmVNZXNoO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVDYW52YXNQbGFuZTtcbiIsImltcG9ydCBLZXlib2FyZENvbnRyb2xzIGZyb20gXCIuL0tleWJvYXJkQ29udHJvbHNcIjtcbmltcG9ydCBLZXlib2FyZEZpZWxkSW5wdXQgZnJvbSBcIi4vS2V5Ym9hcmRGaWVsZElucHV0XCI7XG5pbXBvcnQgY3JlYXRlQ2FudmFzUGxhbmUgZnJvbSBcIi4vY3JlYXRlQ2FudmFzUGxhbmVcIjtcbmltcG9ydCBUZXh0TGluZVBsYW5lIGZyb20gXCIuL1RleHRMaW5lUGxhbmVcIjtcbmltcG9ydCBXb3JsZCBmcm9tIFwiLi93b3JsZC9Xb3JsZFwiO1xuaW1wb3J0IFN0YXRzIGZyb20gXCJzdGF0cy1qc1wiO1xuaW1wb3J0IENsb3VkIGZyb20gXCIuL3dvcmxkL0Nsb3VkXCI7XG5cbndpbmRvdy5kZWJ1ZyA9IGZhbHNlO1xuXG5sZXQgc2hvd1R5cGVCb3ggPSBmYWxzZTtcblxuY29uc3QgbW92ZXMgPSB7XG4gIHZ4OiAwLjAsXG4gIHZ6OiAwLjAsXG4gIGF4OiAwLjAsXG4gIGF6OiAwLjAsXG5cbiAgdnJvdDogMC4wLFxuICBhcm90OiAwLjAsXG5cbiAgcG93ZXI6IDAuMDEsXG4gIHJvdFBvd2VyOiAwLjAwMTUsXG4gIGRyYWc6IDAuOTVcbn07XG5cbmNvbnN0IGtleXMgPSBuZXcgS2V5Ym9hcmRDb250cm9scygpO1xuY29uc3QgZmllbGQgPSBuZXcgS2V5Ym9hcmRGaWVsZElucHV0KCAoIHByb2csIGRvbmUgKSA9PiB7XG5cbiAgaWYgKCBkb25lICkge1xuXG4gICAgc2hvd1R5cGVCb3ggPSBmYWxzZTtcblxuICAgIGlmICggIXByb2cgKSByZXR1cm47XG5cbiAgICBpZiAoIHByb2cgPT09IFwicHJvZFwiICkge1xuXG4gICAgICB3aW5kb3cuZGVidWcgPSAhd2luZG93LmRlYnVnO1xuICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgY29uc3QgeyB4LCB5LCB6IH0gPSBkb2xseS5wb3NpdGlvbjtcblxuICAgIFdvcmxkLmxvYWQoIHByb2csIHsgeCwgeSwgeiB9LCBkb2xseS5yb3RhdGlvbi55ICsgTWF0aC5QSSApO1xuXG4gIH0gZWxzZSB7XG5cbiAgICAgIHNob3dUeXBlQm94ID0gdHJ1ZTtcbiAgICAgIHNjZW5lLnJlbW92ZSggdHlwZXlUZXh0ICk7XG4gICAgICB0eXBleVRleHQgPSBUZXh0TGluZVBsYW5lKCBcIi9cIiArICggcHJvZyA/IHByb2cgOiBcIlwiICkpO1xuICAgICAgdHlwZXlUZXh0LnNjYWxlLnNldCggMC4wMDUsIDAuMDA1LCAwLjAwNSApO1xuICAgICAgc2NlbmUuYWRkKCB0eXBleVRleHQgKTtcblxuICB9XG5cbn0pO1xuXG5jb25zdCBzdGF0cyA9IG5ldyBTdGF0cygpO1xue1xuICBjb25zdCBkb20gPSBzdGF0cy5kb21FbGVtZW50O1xuICBjb25zdCBzdHlsZSA9IGRvbS5zdHlsZTtcbiAgc3RhdHMuc2V0TW9kZSggMCApO1xuICBzdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgc3R5bGUubGVmdCA9IFwiMHB4XCI7XG4gIHN0eWxlLnRvcCA9IFwiMHB4XCI7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRvbSApO1xufVxuXG5jb25zdCByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYW50aWFsaWFzOiB0cnVlIH0pO1xucmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XG5yZW5kZXJlci5zZXRDbGVhckNvbG9yKCAweDIyMjIyMiApO1xucmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG5cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblxuY29uc3Qgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbnNjZW5lLmZvZyA9IG5ldyBUSFJFRS5Gb2coIDB4MTAzMjU4LCAyMCwgMjAwICk7XG5cbmNvbnN0IGRvbGx5ID0gbmV3IFRIUkVFLkdyb3VwKCk7XG5kb2xseS5wb3NpdGlvbi5zZXQoIC0xNSwgMC40LCA1ICk7XG5zY2VuZS5hZGQoZG9sbHkpO1xuXG4vLyBkYW1uIHlvdSBDaHJvbWUuLi5cbi8vIGNvbnN0IGNsb3VkcyA9IG5ldyBBcnJheSggMTAwICkuZmlsbCggdHJ1ZSApXG5jb25zdCBjbG91ZHMgPSBuZXcgQXJyYXkoIDEwMCApXG4gIC5qb2luKClcbiAgLnNwbGl0KCBcIixcIiApXG4gIC5tYXAoICgpID0+IENsb3VkLm1ha2Uoe1xuICAgIHg6IE1hdGgucmFuZG9tKCkgKiAxMDAwIC0gNTAwLFxuICAgIHk6IDQwLFxuICAgIHo6IE1hdGgucmFuZG9tKCkgKiAxMDAwIC0gNTAwXG4gIH0pIClcblxuY2xvdWRzLmZvckVhY2goYyA9PiBzY2VuZS5hZGQoIGMgKSk7XG5cbmNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSggNjAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAyMDAwMCApO1xuY2FtZXJhLnBvc2l0aW9uLnNldCggMCwgMSwgMCApO1xuZG9sbHkuYWRkKCBjYW1lcmEgKTtcbmRvbGx5LnJvdGF0aW9uLnkgPSAtIE1hdGguUEkgLyAyO1xuXG4vLyBFZmZlY3QgYW5kIENvbnRyb2xzIGZvciBWUiwgSW5pdGlhbGl6ZSB0aGUgV2ViVlIgbWFuYWdlclxuY29uc3QgZWZmZWN0ID0gbmV3IFRIUkVFLlZSRWZmZWN0KCByZW5kZXJlciApO1xuY29uc3QgY29udHJvbHMgPSBuZXcgVEhSRUUuVlJDb250cm9scyggY2FtZXJhICk7XG5jb25zdCBtYW5hZ2VyID0gbmV3IFdlYlZSTWFuYWdlciggZWZmZWN0ICk7XG5cbi8vIGxpZ2h0c1xue1xuICAvKlxuICBjb25zdCBhbWIgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweDIyMjIyMiApO1xuICBzY2VuZS5hZGQoYW1iKTtcblxuICBjb25zdCBwb2ludHkgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZjQ0ZWUsIDAsIDMwICk7XG4gIHBvaW50eS5wb3NpdGlvbi5zZXQoIDAsIC0yLCAwICk7XG4gIGRvbGx5LmFkZCggcG9pbnR5ICk7XG4gICovXG5cbiAgY29uc3QgaGVtaUxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCggMHhGRkY1Q0UsIDB4ZmZmZmZmLCAwLjYgKTtcbiAgaGVtaUxpZ2h0LnBvc2l0aW9uLnNldCggMCwgMTAwLCAwICk7XG4gIHNjZW5lLmFkZCggaGVtaUxpZ2h0ICk7XG5cbiAgY29uc3QgZGlyTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCggMHhmZmZmZmYsIDEgKTtcbiAgZGlyTGlnaHQucG9zaXRpb24uc2V0KCAwLCAxMDAsIDU1ICk7XG4gIGRpckxpZ2h0LmNhc3RTaGFkb3cgPSB0cnVlO1xuICBkaXJMaWdodC5zaGFkb3dDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcblxuICBjb25zdCBkID0gMTAwO1xuXG4gIGRpckxpZ2h0LnNoYWRvd0NhbWVyYUZhciA9IDM1MDA7XG4gIC8vZGlyTGlnaHQuc2hhZG93QmlhcyA9IC0wLjAwMTtcbiAgZGlyTGlnaHQuc2hhZG93Q2FtZXJhUmlnaHQgPSBkO1xuICBkaXJMaWdodC5zaGFkb3dDYW1lcmFMZWZ0ID0gLWQ7XG4gIGRpckxpZ2h0LnNoYWRvd0NhbWVyYVRvcCA9IGQ7XG4gIGRpckxpZ2h0LnNoYWRvd0NhbWVyYUJvdHRvbSA9IC1kO1xuICBkaXJMaWdodC5zaGFkb3dEYXJrbmVzcyA9IDAuMztcblxuICBzY2VuZS5hZGQoIGRpckxpZ2h0ICk7XG5cbn1cblxuc2NlbmUuYWRkKCBXb3JsZC5tZXNoICk7XG5cbnJlcXVlc3RBbmltYXRpb25GcmFtZSggYW5pbWF0ZSApO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIFwicmVzaXplXCIsIG9uV2luZG93UmVzaXplLCBmYWxzZSApO1xub25XaW5kb3dSZXNpemUoKTtcblxuY29uc3QgbG9hZFRleHQgPSBUZXh0TGluZVBsYW5lKCBcIkhpdCAnZW50ZXInIHRvIGxvYWQuXCIgKTtcbmxvYWRUZXh0LnBvc2l0aW9uLnNldCggMywgLTEwLCAzICk7XG5zY2VuZS5hZGQoIGxvYWRUZXh0ICk7XG5cbmxldCB0eXBleVRleHQgPSBUZXh0TGluZVBsYW5lKCBcIi9cIiApO1xuc2NlbmUuYWRkKCB0eXBleVRleHQgKTtcblxuV29ybGQubG9hZChcbiAgWyBcImF3d1wiLCBcInBpY3NcIiwgXCJmdW5ueVwiLCBcIm1pbGRseWludGVyZXN0aW5nXCIgXVsgTWF0aC5yYW5kb20oKSAqIDQgfCAwIF0sXG4gIHsgeDogZG9sbHkucG9zaXRpb24ueCwgeTogMCwgejogZG9sbHkucG9zaXRpb24ueiB9LFxuICBkb2xseS5yb3RhdGlvbi55ICsgTWF0aC5QSVxuKTtcblxuZG9sbHkudHJhbnNsYXRlWiggMjAgKTtcbmRvbGx5LnJvdGF0aW9uLnkgLT0gMC4yO1xuXG5cbmZ1bmN0aW9uIG9uV2luZG93UmVzaXplICgpIHtcblxuICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gIGVmZmVjdC5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSAoIHRpbWUgKSB7XG5cbiAgc3RhdHMuYmVnaW4oKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGFuaW1hdGUgKTtcblxuICBjb250cm9scy51cGRhdGUoKTtcblxuICAvLyBSb3RhdGlvblxuICBtb3Zlcy5hcm90ID0ga2V5cy5yb3QoKSAqIG1vdmVzLnJvdFBvd2VyO1xuICBtb3Zlcy52cm90ICs9IG1vdmVzLmFyb3Q7XG4gIG1vdmVzLnZyb3QgKj0gbW92ZXMuZHJhZztcblxuICBkb2xseS5yb3RhdGlvbi55IC09IG1vdmVzLnZyb3Q7XG5cbiAgLy8gTW92ZW1lbnRcbiAgbW92ZXMuYXggPSBrZXlzLngoKSAqIG1vdmVzLnBvd2VyO1xuICBtb3Zlcy5heiA9IGtleXMueSgpICogbW92ZXMucG93ZXI7XG4gIG1vdmVzLnZ4ICs9IG1vdmVzLmF4O1xuICBtb3Zlcy52eiArPSBtb3Zlcy5hejtcbiAgbW92ZXMudnggKj0gbW92ZXMuZHJhZztcbiAgbW92ZXMudnogKj0gbW92ZXMuZHJhZztcblxuICBkb2xseS50cmFuc2xhdGVYKCBtb3Zlcy52eCApO1xuICBkb2xseS50cmFuc2xhdGVaKCBtb3Zlcy52eiApO1xuICBkb2xseS50cmFuc2xhdGVZKCBrZXlzLnZlcnQoKSAqIChtb3Zlcy5wb3dlciAqIDMuNSkgKTtcblxuICAvLyBTdGF5IGFib3ZlIGdyb3VuZFxuICBpZiAoZG9sbHkucG9zaXRpb24ueSA8IDApIGRvbGx5LnBvc2l0aW9uLnkgPSAwO1xuXG4gIGlmICgga2V5cy56ZXJvKCkgKSB7XG5cbiAgICBjb250cm9scy56ZXJvU2Vuc29yKCk7XG5cbiAgfVxuXG4gIHdoYXRBcmVZb3VMb29raW5nQXQoKTtcblxuICBpZiAoIHNob3dUeXBlQm94ICkge1xuXG4gICAgdHlwZXlUZXh0LnBvc2l0aW9uLmNvcHkoIGRvbGx5LnBvc2l0aW9uICk7XG4gICAgdHlwZXlUZXh0LnJvdGF0aW9uLmNvcHkoIGRvbGx5LnJvdGF0aW9uICk7XG4gICAgdHlwZXlUZXh0LnRyYW5zbGF0ZVooIC0yICk7XG4gICAgdHlwZXlUZXh0LnRyYW5zbGF0ZVkoIDEuNSApO1xuXG4gIH0gZWxzZSB7XG5cbiAgICB0eXBleVRleHQucG9zaXRpb24ueSA9IC0xMDtcblxuICB9XG5cbiAgaWYgKCBtYW5hZ2VyLmlzVlJNb2RlKCkgKSB7XG5cbiAgICBlZmZlY3QucmVuZGVyKCBzY2VuZSwgY2FtZXJhICk7XG5cbiAgfSBlbHNlIHtcblxuICAgIHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIGNhbWVyYSApO1xuXG4gIH1cblxuICBjbG91ZHMuZm9yRWFjaChjID0+IENsb3VkLm1vdmUoIGMgKSk7XG5cbiAgc3RhdHMuZW5kKCk7XG5cbn1cblxuY29uc3Qgd2hhdEFyZVlvdUxvb2tpbmdBdCA9ICgpID0+IHtcblxuICBjb25zdCBkaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgLTEgKS50cmFuc2Zvcm1EaXJlY3Rpb24oIGNhbWVyYS5tYXRyaXhXb3JsZCApO1xuICBjb25zdCByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCBkb2xseS5wb3NpdGlvbiwgZGlyZWN0aW9uLCAwLCAxMCApO1xuICBjb25zdCBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoIFdvcmxkLm1lc2guY2hpbGRyZW4sIHRydWUgKTtcblxuICBpZiAoIGludGVyc2VjdHMubGVuZ3RoICkge1xuXG4gICAgY29uc3Qgc2lnbiA9IGludGVyc2VjdHNbIDAgXS5vYmplY3QucGFyZW50O1xuICAgIGlmICggc2lnbiAmJiBzaWduLl9kYXRhICkge1xuXG4gICAgICBjb25zdCB0aXRsZSA9IHNpZ24uX2RhdGEudGl0bGVcbiAgICAgIGNvbnN0IGlzU3ViUmVkZGl0ID0gdGl0bGUubWF0Y2goIC9cXC9yXFwvW2EtekEtWl9dKyQvZyApXG5cbiAgICAgIHNpZ24uc2NhbGUueCA9IDEgKyAoICggTWF0aC5zaW4oIERhdGUubm93KCkgLyAxMDAwICkgKyAxICkgKiAwLjAzICk7XG5cbiAgICAgIGlmICggaXNTdWJSZWRkaXQgKSB7XG5cbiAgICAgICAgbG9hZFRleHQucG9zaXRpb24uY29weSggc2lnbi5wb3NpdGlvbiApO1xuICAgICAgICBsb2FkVGV4dC5yb3RhdGlvbi5jb3B5KCBzaWduLnJvdGF0aW9uICk7XG4gICAgICAgIGxvYWRUZXh0LnRyYW5zbGF0ZVooIDEgKTtcbiAgICAgICAgbG9hZFRleHQucG9zaXRpb24ueSA9IDMuODtcblxuICAgICAgfVxuXG4gICAgICBpZiAoIGtleXMuZW50ZXIoKSAmJiBpc1N1YlJlZGRpdCApIHtcblxuICAgICAgICBjb25zdCBzdWIgPSB0aXRsZS5zbGljZSggMyApO1xuICAgICAgICBjb25zdCB7IHgsIHogfSA9IGRvbGx5LnBvc2l0aW9uO1xuXG4gICAgICAgIFdvcmxkLmxvYWQoIHN1YiwgeyB4LCB5OiBzaWduLnBvc2l0aW9uLnksIHogfSwgc2lnbi5yb3RhdGlvbi55ICsgTWF0aC5QSSApO1xuICAgICAgICBrZXlzLmVudGVyKCB0cnVlICk7XG5cbiAgICAgICAgc2lnbi5wYXJlbnQucmVtb3ZlKCBzaWduICk7XG4gICAgICAgIGxvYWRUZXh0LnBvc2l0aW9uLnNldCggMywgLTEwLCAzICk7IC8vIEhpZGUgbG9hZFRFeHQgYm94XG5cbiAgICAgIH1cblxuICAgICAgaWYgKCBrZXlzLmFjdGlvbigpICkge1xuXG4gICAgICAgIHNpZ24ucGFyZW50LnJlbW92ZSggc2lnbiApO1xuICAgICAgICBrZXlzLmFjdGlvbiggdHJ1ZSApO1xuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcblxuICAgIGxvYWRUZXh0LnBvc2l0aW9uLnkgPSAtMTA7XG5cbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IHt9O1xuIiwiY29uc3Qgc3BlZWQgPSAwLjAxO1xuXG5jb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKCB7IGNvbG9yOiAweGVlZWVlZSB9ICk7XG5cbmNvbnN0IG1ha2UgPSAoIHsgeCwgeSwgeiB9ICkgPT4ge1xuXG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KFxuICAgICAgTWF0aC5yYW5kb20oKSAqIDMwICsgMTUsXG4gICAgICAxLFxuICAgICAgTWF0aC5yYW5kb20oKSAqIDQwICsgMTVcbiAgKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKCBnZW9tZXRyeSwgbWF0ZXJpYWwgKTtcblxuICBjb25zdCBwb3NWZWMzID0gbmV3IFRIUkVFLlZlY3RvcjMoIHgsIHksIHogKTtcbiAgbWVzaC5wb3NpdGlvbi5jb3B5KCBwb3NWZWMzICk7XG4gIG1lc2gubG9va0F0KCBwb3NWZWMzLmFkZCggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDEgKSApICk7XG5cbiAgcmV0dXJuIG1lc2g7XG5cbn07XG5cbmNvbnN0IG1vdmUgPSAoIGNsb3VkICkgPT4ge1xuXG4gIGNsb3VkLnRyYW5zbGF0ZVooIHNwZWVkICk7XG5cbiAgaWYgKCBjbG91ZC5wb3NpdGlvbi56ID4gMTAwMCApIHtcblxuICAgIGNsb3VkLnBvc2l0aW9uLnogLT0gMjAwMDtcbiAgICBjbG91ZC5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSAqIDUwMCAtIDI1MDtcblxuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbW92ZSxcbiAgbWFrZVxufTtcbiIsImNvbnN0IEltZ1VyTWVzaCA9ICggaW1nTmFtZSA9IFwiZEF2V2tOOC5qcGdcIiApID0+IHtcblxuICBUSFJFRS5JbWFnZVV0aWxzLmNyb3NzT3JpZ2luID0gXCJBbm9ueW1vdXNcIjtcbiAgY29uc3QgdXJsID0gaW1nTmFtZS5zdGFydHNXaXRoKCBcImh0dHBcIiApID8gaW1nTmFtZSA6IGBodHRwOi8vaS5pbWd1ci5jb20vJHsgaW1nTmFtZSB9YFxuXG4gIGNvbnN0IHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCB1cmwsIHVuZGVmaW5lZCwgKCBkYXRhICkgPT4ge30sICggZXJyICkgPT4ge1xuXG4gICAgY29uc29sZS5sb2coXCJFcnJvciBsb2FkaW5nIHRleHR1cmU6XCIsIHVybCwgaW1nTmFtZSwgZXJyKTtcblxuICB9ICk7XG5cbiAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIG1hcDogdGV4dHVyZSxcbiAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlXG4gIH0pO1xuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KCA0LCA0ICk7XG5cbiAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKCBnZW9tZXRyeSwgbWF0ZXJpYWwgKTtcblxufVxuXG5leHBvcnQgZGVmYXVsdCBJbWdVck1lc2g7XG4iLCJpbXBvcnQgY3JlYXRlQ2FudmFzUGxhbmUgZnJvbSBcIi4uL2NyZWF0ZUNhbnZhc1BsYW5lXCI7XG5pbXBvcnQgd3JhcENhbnZhc1RleHQgZnJvbSBcIi4uL3dyYXBDYW52YXNUZXh0XCI7XG5pbXBvcnQgSW1nVXJNZXNoIGZyb20gXCIuL0ltZ1VyTWVzaFwiO1xuaW1wb3J0IE9iZWxpc2sgZnJvbSBcIi4vT2JlbGlza1wiO1xuXG5jb25zdCBJbnN0cnVjdGlvbnMgPSAoKSA9PiB7XG5cbiAgY29uc3QgZ3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcblxuICBjb25zdCBvYiA9IE9iZWxpc2soIDYsIDcsIDAuNSApO1xuICBvYi5wb3NpdGlvbi5zZXQoIDAsIDMuNSwgMCApXG4gIGdyb3VwLmFkZCggb2IgKTtcblxuICBjb25zdCB0ZXh0ID0gY3JlYXRlQ2FudmFzUGxhbmUoIDM1MCwgMjU2LCAoIGN0eCwgdywgaCApID0+IHtcblxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSAzNTtcbiAgICBsZXQgb2Zmc2V0ID0gMDtcblxuICAgIGN0eC5mb250ID0gXCIyMHB0IEhlbHZldGljYSwgQXJpYWwsIFNhbnMtU2VyaWZcIjtcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOClcIjtcbiAgICBjdHguZmlsbFRleHQoXCIvIHRvIGVudGVyIHR5cGluZyBtb2RlXCIsIDAsIG9mZnNldCArPSBsaW5lSGVpZ2h0KTtcbiAgICBjdHguZmlsbFRleHQoXCJXU0FEOiBNb3ZlXCIsIDAsIG9mZnNldCArPSBsaW5lSGVpZ2h0KTtcbiAgICBjdHguZmlsbFRleHQoXCJBcnJvd3M6IFJvdGF0ZVwiLCAwLCBvZmZzZXQgKz0gbGluZUhlaWdodCk7XG4gICAgY3R4LmZpbGxUZXh0KFwiUS9FOiBVcCAnbiBkb3duXCIsIDAsIG9mZnNldCArPSBsaW5lSGVpZ2h0KTtcbiAgICBjdHguZmlsbFRleHQoXCJFbnRlcjogTG9hZCBhIC9yLyBvYmVsaXNrXCIsIDAsIG9mZnNldCArPSBsaW5lSGVpZ2h0KTtcbiAgICBjdHguZmlsbFRleHQoXCJTcGFjZTogUmVtb3ZlIGFuIG9iZWxpc2tcIiwgMCwgb2Zmc2V0ICs9IGxpbmVIZWlnaHQpO1xuICAgIGN0eC5maWxsVGV4dChcIlo6IHJlc2V0IFZSIHNlbnNvclwiLCAwLCBvZmZzZXQgKz0gbGluZUhlaWdodCk7XG5cbiAgfSk7XG4gIHRleHQucG9zaXRpb24uc2V0KCAtMC4yLCA1LjIsIDAuMjggKTtcbiAgZ3JvdXAuYWRkKCB0ZXh0ICk7XG5cbiAgY29uc3QgaW1nID0gSW1nVXJNZXNoKCBcImRBdldrTjguanBnXCIgKTtcbiAgaW1nLnBvc2l0aW9uLnNldCggMCwgMiwgMC4yOSApO1xuICBpbWcuc2NhbGUueSA9IDAuODtcbiAgZ3JvdXAuYWRkKCBpbWcgKTtcblxuICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEluc3RydWN0aW9ucztcbiIsImltcG9ydCBjcmVhdGVDYW52YXNQbGFuZSBmcm9tIFwiLi4vY3JlYXRlQ2FudmFzUGxhbmVcIjtcbmltcG9ydCB3cmFwQ2FudmFzVGV4dCBmcm9tIFwiLi4vd3JhcENhbnZhc1RleHRcIjtcbmltcG9ydCBPYmVsaXNrIGZyb20gXCIuL09iZWxpc2tcIjtcblxuY29uc3QgTGluayA9ICggdGl0bGUgPSBcInRpdGxlXCIsIHVybCApID0+IHtcblxuICBjb25zdCBncm91cCA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuXG4gIGNvbnN0IG9iID0gT2JlbGlzayggNiwgNSwgMC41ICk7XG4gIG9iLnBvc2l0aW9uLnNldCggMCwgMi41LCAwIClcbiAgZ3JvdXAuYWRkKCBvYiApO1xuXG4gIGNvbnN0IHRleHQgPSBjcmVhdGVDYW52YXNQbGFuZSggMjU2LCAyNTYsICggY3R4LCB3LCBoICkgPT4ge1xuXG4gICAgY3R4LmZvbnQgPSBcIjIycHQgSGVsdmV0aWNhLCBBcmlhbCwgU2Fucy1TZXJpZlwiO1xuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC44KVwiO1xuICAgIHdyYXBDYW52YXNUZXh0KCBjdHgsIHRpdGxlLCAwLCAzMCwgdywgMzAgKTtcblxuICB9KTtcbiAgdGV4dC5wb3NpdGlvbi5zZXQoIDAsIDEuNSwgMC4yOCApO1xuICBncm91cC5hZGQoIHRleHQgKTtcbiAgZ3JvdXAuX2RhdGEgPSB7XG4gICAgdGl0bGVcbiAgfTtcblxuICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpbms7XG4iLCJjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDIyMjIyMlxufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICggeCA9IDEwLCB5ID0gMjAsIHogPSAxICkgPT4ge1xuXG4gIGNvbnN0IGJveCA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggeCwgeSwgeiApO1xuICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLk1lc2goIGJveCwgbWF0ZXJpYWwgKTtcblxuICBtZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuXG4gIHJldHVybiBtZXNoO1xuXG59O1xuIiwiaW1wb3J0IGNyZWF0ZUNhbnZhc1BsYW5lIGZyb20gXCIuLi9jcmVhdGVDYW52YXNQbGFuZVwiO1xuaW1wb3J0IHdyYXBDYW52YXNUZXh0IGZyb20gXCIuLi93cmFwQ2FudmFzVGV4dFwiO1xuaW1wb3J0IEltZ1VyTWVzaCBmcm9tIFwiLi9JbWdVck1lc2hcIjtcbmltcG9ydCBPYmVsaXNrIGZyb20gXCIuL09iZWxpc2tcIjtcblxuY29uc3QgU2lnbiA9ICggdGl0bGUgPSBcInRpdGxlXCIsIHVybCApID0+IHtcblxuICBjb25zdCBncm91cCA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuXG4gIGNvbnN0IG9iID0gT2JlbGlzayggNiwgNywgMC41ICk7XG4gIG9iLnBvc2l0aW9uLnNldCggMCwgMy41LCAwIClcbiAgZ3JvdXAuYWRkKCBvYiApO1xuXG4gIGNvbnN0IHRleHQgPSBjcmVhdGVDYW52YXNQbGFuZSggMjU2LCAyNTYsICggY3R4LCB3LCBoICkgPT4ge1xuXG4gICAgY3R4LmZvbnQgPSBcIjIycHQgSGVsdmV0aWNhLCBBcmlhbCwgU2Fucy1TZXJpZlwiO1xuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC44KVwiO1xuICAgIHdyYXBDYW52YXNUZXh0KCBjdHgsIHRpdGxlLCAwLCAzMCwgdywgMzAgKTtcblxuICB9KTtcbiAgdGV4dC5wb3NpdGlvbi5zZXQoIDAsIDUsIDAuMjggKTtcbiAgZ3JvdXAuYWRkKCB0ZXh0ICk7XG4gIGdyb3VwLl9kYXRhID0ge1xuICAgIHRpdGxlXG4gIH07XG5cbiAgaWYgKCAhd2luZG93LmRlYnVnICYmIHVybCAmJiB1cmwuaW5kZXhPZiggXCJpbWd1ci5jb21cIiApID49IDAgKSB7XG5cbiAgICBpZiAoIHVybC5lbmRzV2l0aCggXCIuZ2lmdlwiICkgKSB7XG5cbiAgICAgIHVybCA9IHVybC5zbGljZSggNCApICsgXCIuZ2lmXCI7XG4gICAgICBjb25zb2xlLmxvZyggXCJNb3ZlZCAuZ2lmdiB0byBnaWY6XCIsIHVybCApO1xuXG4gICAgfVxuXG4gICAgaWYgKCAhICggdXJsLmVuZHNXaXRoKFwiLnBuZ1wiKSB8fCB1cmwuZW5kc1dpdGgoXCIuanBnXCIpIHx8IHVybC5lbmRzV2l0aChcIi5naWZcIikgKSApIHtcblxuICAgICAgY29uc29sZS5sb2coIFwiTk9QP1wiLCB1cmwgKVxuICAgICAgdXJsICs9IFwiLmpwZ1wiO1xuXG4gICAgfVxuXG4gICAgaWYgKCB1cmwuc3RhcnRzV2l0aCggXCJodHRwOi8vaW1ndXJcIiApICkgdXJsID0gXCJodHRwOi8vaS5cIiArIHVybC5zbGljZSggNyApO1xuICAgIGlmICggdXJsLnN0YXJ0c1dpdGgoIFwiaHR0cHM6Ly9pbWd1clwiICkgKSB1cmwgPSBcImh0dHBzOi8vaS5cIiArIHVybC5zbGljZSggOCApO1xuXG4gICAgY29uc3QgaW1nID0gSW1nVXJNZXNoKCB1cmwgKTtcbiAgICBpbWcucG9zaXRpb24uc2V0KCAwLCAyLjUsIDAuMjkgKTtcbiAgICBncm91cC5hZGQoIGltZyApO1xuXG4gIH1cblxuICByZXR1cm4gZ3JvdXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNpZ247XG4iLCJcbmNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KCAxMDAwMCwgNjQsIDMyICk7XG5jb25zdCB2ZXJ0aWNlcyA9IGdlb21ldHJ5LnZlcnRpY2VzO1xuY29uc3QgZmFjZXMgPSBnZW9tZXRyeS5mYWNlcztcblxuY29uc3QgY29sb3JUb3AgPSBuZXcgVEhSRUUuQ29sb3IoIDB4MDAxRjRCICk7XG5jb25zdCBjb2xvck1pZGRsZSA9IG5ldyBUSFJFRS5Db2xvciggMHgxQTNDNjIgKTtcbmNvbnN0IGNvbG9yQm90dG9tID0gbmV3IFRIUkVFLkNvbG9yKCAweDU5NkY4NyApO1xuXG5mb3IgKCBsZXQgaSA9IDAsIGwgPSBmYWNlcy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cbiAgY29uc3QgZmFjZSA9IGZhY2VzWyBpIF07XG5cbiAgY29uc3QgdmVydGV4MSA9IHZlcnRpY2VzWyBmYWNlLmEgXTtcbiAgY29uc3QgdmVydGV4MiA9IHZlcnRpY2VzWyBmYWNlLmIgXTtcbiAgY29uc3QgdmVydGV4MyA9IHZlcnRpY2VzWyBmYWNlLmMgXTtcblxuICBjb25zdCBjb2xvcjEgPSBjb2xvck1pZGRsZS5jbG9uZSgpO1xuICBjb2xvcjEubGVycCggdmVydGV4MS55ID4gMCA/IGNvbG9yVG9wIDogY29sb3JCb3R0b20sIE1hdGguYWJzKCB2ZXJ0ZXgxLnkgKSAvIDYwMDAgKTtcblxuICBjb25zdCBjb2xvcjIgPSBjb2xvck1pZGRsZS5jbG9uZSgpO1xuICBjb2xvcjIubGVycCggdmVydGV4Mi55ID4gMCA/IGNvbG9yVG9wIDogY29sb3JCb3R0b20sIE1hdGguYWJzKCB2ZXJ0ZXgyLnkgKSAvIDYwMDAgKTtcblxuICBjb25zdCBjb2xvcjMgPSBjb2xvck1pZGRsZS5jbG9uZSgpO1xuICBjb2xvcjMubGVycCggdmVydGV4My55ID4gMCA/IGNvbG9yVG9wIDogY29sb3JCb3R0b20sIE1hdGguYWJzKCB2ZXJ0ZXgzLnkgKSAvIDYwMDAgKTtcblxuICBmYWNlLnZlcnRleENvbG9ycy5wdXNoKCBjb2xvcjEsIGNvbG9yMiwgY29sb3IzICk7XG5cbn1cblxuY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHtcbiAgdmVydGV4Q29sb3JzOiBUSFJFRS5WZXJ0ZXhDb2xvcnMsXG4gIHNpZGU6IFRIUkVFLkJhY2tTaWRlLFxuICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgZm9nOiBmYWxzZVxufSApO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiBuZXcgVEhSRUUuTWVzaCggZ2VvbWV0cnksIG1hdGVyaWFsICk7XG4iLCJpbXBvcnQgUmVkZGl0QVBJIGZyb20gXCIuLi9SZWRkaXRBUElcIjtcbmltcG9ydCBTa3lCb3ggZnJvbSBcIi4vU2t5Qm94XCI7XG5pbXBvcnQgZ3JvdW5kIGZyb20gXCIuL2dyb3VuZFwiO1xuaW1wb3J0IFNpZ24gZnJvbSBcIi4vU2lnblwiO1xuaW1wb3J0IEluc3RydWN0aW9ucyBmcm9tIFwiLi9JbnN0cnVjdGlvbnNcIjtcbmltcG9ydCBMaW5rIGZyb20gXCIuL0xpbmtcIjtcblxuY29uc3Qgd29ybGQgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbndvcmxkLmFkZCggU2t5Qm94KCkgKTtcbndvcmxkLmFkZCggZ3JvdW5kICk7XG5cbmNvbnN0IG9iID0gSW5zdHJ1Y3Rpb25zKCk7XG5vYi5wb3NpdGlvbi5zZXQoIC0yMCwgMCwgMTUgKTtcbm9iLnJvdGF0aW9uLnkgPSBNYXRoLlBJICsgTWF0aC5QSSAvIDQ7XG53b3JsZC5hZGQoIG9iICk7XG5cbmNvbnN0IHBvc2l0aW9uU2lnbnMgPSAoIHNpZ25zLCBwb3MgPSB7IHg6IDAsIHk6IDAsIHo6IDAgfSwgcm90ICkgPT4ge1xuXG4gIGNvbnN0IHBsYWNlciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICBwbGFjZXIucG9zaXRpb24uY29weSggcG9zICk7XG4gIHBsYWNlci5yb3RhdGlvbi55ID0gcm90ICE9PSB1bmRlZmluZWQgPyByb3QgOiBNYXRoLnJhbmRvbSgpICogKDIgKiBNYXRoLlBJKTtcblxuICBjb25zdCBvZmYgPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XG4gIGNvbnN0IGRpciA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBNYXRoLnNpbiA6IE1hdGguY29zXG4gIGNvbnN0IGRpc3QgPSAoTWF0aC5yYW5kb20oKSAqIDEzIHwgMCkgKyA1O1xuXG4gIHJldHVybiBzaWducy5tYXAgKCAoIHNpZ24sIGkgKSA9PiB7XG5cbiAgICBzaWduLnJvdGF0aW9uLnkgPSBwbGFjZXIucm90YXRpb24ueSArICggKCBpICUgMiA9PT0gMCA/IC0xIDogMSApICogTWF0aC5QSSAvIDIgKTtcbiAgICBzaWduLnBvc2l0aW9uLmNvcHkoIHBsYWNlci5wb3NpdGlvbiApO1xuICAgIHNpZ24udHJhbnNsYXRlWiggLTkgKTsgLy8gQ29ycmlkb3Igd2lkdGhcblxuICAgIHBsYWNlci50cmFuc2xhdGVYKCBkaXIoIChvZmYgKyBpKSAvIGRpc3QgKSAqIDAuNyApO1xuICAgIHBsYWNlci50cmFuc2xhdGVaKCAzLjUgKTtcblxuICAgIHJldHVybiBzaWduO1xuXG4gIH0pO1xuXG59XG5cbmNvbnN0IGxvYWRTdWIgPSAoIHN1YlJlZGRpdCApID0+IFJlZGRpdEFQSVxuICAubG9hZCggc3ViUmVkZGl0IClcbiAgLnRoZW4oIHBvc3RzID0+IHBvc3RzLm1hcChcbiAgICAoeyBkYXRhOiB7IHRpdGxlLCB1cmwgfSB9KSA9PiBTaWduKCB0aXRsZSwgdXJsIClcbiAgKSApO1xuXG5jb25zdCBmaW5kUmVsYXRlZFN1YnMgPSAoIHN1YlJlZGRpdCApID0+IFJlZGRpdEFQSVxuICAubG9hZEFib3V0U3ViKCBzdWJSZWRkaXQgKVxuICAudGhlbiggYWJvdXQgPT4gYWJvdXQuZGVzY3JpcHRpb25cbiAgICAubWF0Y2goIC9cXC9yXFwvW2EtekEtWl9dKy9nIClcbiAgICAubWFwKCBzdWIgPT4gc3ViLnRvTG93ZXJDYXNlKCkgKVxuICAgIC5maWx0ZXIoICggdmFsdWUsIGluZGV4LCBzZWxmICkgPT4gc2VsZi5pbmRleE9mKCB2YWx1ZSApID09PSBpbmRleCApXG4gIClcbiAgLnRoZW4oIHJlbGF0ZWQgPT4gcmVsYXRlZC5tYXAoIHN1YiA9PiBMaW5rKCBzdWIgKSApIClcblxuY29uc3QgbG9hZCA9ICggc3ViUmVkZGl0LCBwb3MsIHJvdCApID0+IHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICBsb2FkU3ViKCBzdWJSZWRkaXQgKSxcbiAgICBmaW5kUmVsYXRlZFN1YnMoIHN1YlJlZGRpdCApXG4gIF0pXG4gIC50aGVuKCAoWyBwb3N0cywgbGlua3MgXSkgPT4gcG9zdHMuY29uY2F0KCBsaW5rcyApLnNvcnQoICgpID0+IE1hdGgucmFuZG9tKCkgPCAwLjUgKSApXG4gIC50aGVuKCBzaWducyA9PiBwb3NpdGlvblNpZ25zKCBzaWducywgcG9zLCByb3QgKSApXG4gIC50aGVuKCBzaWducyA9PiBzaWducy5tYXAoIHNpZ24gPT4ge1xuXG4gICAgd29ybGQuYWRkKCBzaWduICk7XG4gICAgcmV0dXJuIHNpZ247XG5cbiAgfSApICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbG9hZCxcbiAgbWVzaDogd29ybGRcbn07XG4iLCIvLyBmbG9vclxuY29uc3QgZ3Jhc3NUZXggPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWcvc2FuZC5qcGcnKTtcbmdyYXNzVGV4LndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG5ncmFzc1RleC53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuZ3Jhc3NUZXgucmVwZWF0LnggPSAyMDQ2O1xuZ3Jhc3NUZXgucmVwZWF0LnkgPSAyMDQ2O1xuXG5jb25zdCBncm91bmQgPSBuZXcgVEhSRUUuTWVzaChcbiAgbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoIDEwMDAwLCAxMDAwMCApLFxuICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IGdyYXNzVGV4IH0pICk7XG5cbmdyb3VuZC5wb3NpdGlvbi55ID0gMDtcbmdyb3VuZC5yb3RhdGlvbi54ID0gLSBNYXRoLlBJIC8gMjtcbmdyb3VuZC5yZW5kZXJEZXB0aCA9IDI7XG5ncm91bmQucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IGdyb3VuZDtcblxuIiwiZnVuY3Rpb24gd3JhcFRleHQgKCBjdHgsIHRleHQsIHgsIHksIG1heFdpZHRoLCBsaW5lSGVpZ2h0ICkge1xuXG4gIGNvbnN0IGRyYXdMaW5lID0gKCBsaW5lLCBpICkgPT4gY3R4LmZpbGxUZXh0KCBsaW5lLCB4LCB5ICsgKCBpICogbGluZUhlaWdodCApICk7XG5cbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KFwiIFwiKS5yZWR1Y2UoIChhYywgd29yZCwgaSkgPT4ge1xuXG4gICAgY29uc3QgbGluZSA9IGFjLmN1cnIgKyB3b3JkICsgXCIgXCI7XG4gICAgY29uc3Qgb3ZlcndpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KCBsaW5lICkud2lkdGggPiBtYXhXaWR0aCAmJiBpID4gMDtcblxuICAgIHJldHVybiB7XG4gICAgICBsaW5lczogb3ZlcndpZHRoID8gWy4uLmFjLmxpbmVzLCBhYy5jdXJyXSA6IGFjLmxpbmVzLFxuICAgICAgY3Vycjogb3ZlcndpZHRoID8gd29yZCArIFwiIFwiIDogbGluZVxuICAgIH1cblxuICB9LCB7IGxpbmVzOiBbXSwgY3VycjogXCJcIiB9KTtcblxuICAvLyBBZGQgdGhlIGZpbmFsIGxpbmUsIGFuZCBkcmF3IHRoZW1cbiAgWy4uLmxpbmVzLmxpbmVzLCBsaW5lcy5jdXJyXS5mb3JFYWNoKCBkcmF3TGluZSApO1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IHdyYXBUZXh0O1xuIl19
