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
        this.progressCb( this.phrase, false );

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

      if (e.keyCode === /* delete */ 8) {
        this.phrase = this.phrase.slice(0, -1);
      } else {

        let ch = String.fromCharCode( e.keyCode ).toLowerCase();

        if (e.keyCode === /* dash */ 173) {
          ch = "_";
        }

        if (ch.match( /[a-zA-Z_]+$/g ) ) {
          this.phrase += ch;
        }
      }
      this.progressCb( this.phrase, false );

    }

  }

}

export default KeyboardFieldInput;
