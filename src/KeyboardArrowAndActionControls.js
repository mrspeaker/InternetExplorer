function KeyboardArrowAndActionControls () {

  this._keys = {};

  document.body.addEventListener("keydown", this._onDown.bind(this), false);
  document.body.addEventListener("keyup", this._onUp.bind(this), false);
}

KeyboardArrowAndActionControls.prototype = {

  _onDown: function (e) {
    if ([37,38,39,40].indexOf(e.which) >= 0) {
      e.preventDefault();
    }
    this._keys[e.which] = 1;
  },

  _onUp: function (e) {
    this._keys[e.which] = 0;
  },

  action: function () {
    return this._keys[32];
  },

  rot: function () {
    var left = (this._keys[37]) ? 1 : 0;
    var right = (this._keys[39]) ? 1 : 0;
    return -left +right;
  },

  x: function () {
    var left = (this._keys[81] || this._keys[65]) ? 1 : 0;
    var right = (this._keys[68]) ? 1 : 0;
    return -left +right;
  },

  y: function () {
    var up = (this._keys[90] || this._keys[87]) ? 1 : 0;
    var down = (this._keys[83]) ? 1 : 0;
    return -up +down;
  }

};

export default KeyboardArrowAndActionControls;