class KeyboardControls {

  constructor () {

    this._keys = {};

    document.body.addEventListener( "keydown", this._onDown.bind( this ), false );
    document.body.addEventListener( "keyup", this._onUp.bind( this ), false );

  }

  _onDown ( e ) {

    if ( [ 37, 38, 39, 40 ].indexOf( e.which ) >= 0 ) {

      e.preventDefault();

    }
    this._keys[ e.which ] = 1;

  }

  _onUp ( e ) {

    this._keys[ e.which ] = 0;

  }

  action ( release ) {

    if ( release ) {

      this._keys[ 32 ] = false;
      return;

    }

    return this._keys[ 32 ];

  }

  enter (release) {

    if ( release ) {

      this._keys[ 13 ] = false;
      return;

    }

    return this._keys[ 13 ];

  }

  rot () {

    const left = this._keys[ 37 ] ? 1 : 0;
    const right = this._keys[ 39 ] ? 1 : 0;
    return -left + right;

  }

  vert () {

    const up = this._keys[ 81 ] ? 1 : 0;
    const down = this._keys[ 69 ] ? 1 : 0;
    return -up + down;

  }

  x () {

    const left = ( this._keys[ 65 ] ) ? 1 : 0;
    const right = this._keys[ 68 ] ? 1 : 0;
    return -left + right;

  }

  y () {

    const up = ( this._keys[ 90 ] || this._keys[ 87 ] ) ? 1 : 0;
    const down = this._keys[ 83 ] ? 1 : 0;
    return -up + down;

  }
}

export default KeyboardControls;
