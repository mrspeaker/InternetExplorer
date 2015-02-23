class KeyboardFieldInput {

  constructor ( progressCb ) {

    this.phrase = "";
    this.collecting = false;

    this.progressCb = progressCb;

    document.addEventListener( "keydown", this.onDown.bind(this), false );

  }

  _done ( blnWithWord ) {

    this.collecting = false;
    this.progressCb ( blnWithWord ? this.phrase : undefined, true );
    this.phrase = "";

  }

  onDown ( e ) {

    if ( e.keyCode === 191 ) {

      e.preventDefault();

      if ( this.collecting ) {

        this._done( false );

      } else {

        this.phrase = "";
        this.collecting = true;

      }

      return;

    }

    if ( !this.collecting ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if ( e.keyCode === 13 ) {

      this._done( true );

    }

    else {

      this.phrase += String.fromCharCode( e.keyCode ).toLowerCase();
      this.progressCb( this.phrase, false );

    }

  }

}

export default KeyboardFieldInput;
