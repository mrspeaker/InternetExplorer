function wrapText( context, text, x, y, maxWidth, lineHeight ) {

  const words = text.split(" ");
  let line = "";

  for ( let n = 0; n < words.length; n++ ) {

    const testLine = line + words[ n ] + " ";
    const metrics = context.measureText( testLine );
    const testWidth = metrics.width;

    if ( testWidth > maxWidth && n > 0 ) {

      context.fillText( line, x, y );
      line = words[ n ] + " ";
      y += lineHeight;

    } else {

      line = testLine;

    }
  }

  context.fillText( line, x, y );

}

export default wrapText;
