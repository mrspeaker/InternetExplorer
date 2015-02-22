class KeyboardArrowAndActionControls {

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

  action () {

    return this._keys[ 32 ];

  }

  rot () {

    const left = this._keys[ 37 ] ? 1 : 0;
    const right = this._keys[ 39 ] ? 1 : 0;
    return -left + right;

  }

  x () {

    const left = ( this._keys[ 81 ] || this._keys[ 65 ] ) ? 1 : 0;
    const right = this._keys[ 68 ] ? 1 : 0;
    return -left + right;

  }

  y () {

    const up = ( this._keys[ 90 ] || this._keys[ 87 ] ) ? 1 : 0;
    const down = this._keys[ 83 ] ? 1 : 0;
    return -up + down;

  }
}

export default KeyboardArrowAndActionControls;
