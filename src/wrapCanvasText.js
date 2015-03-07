function wrapText ( ctx, text, x, y, maxWidth, lineHeight ) {

  const drawLine = ( line, i ) => ctx.fillText( line, x, y + ( i * lineHeight ) );

  const lines = text.split(" ").reduce( (ac, word, i) => {

    const line = ac.curr + word + " ";
    const overwidth = ctx.measureText( line ).width > maxWidth && i > 0;

    return {
      lines: overwidth ? [...ac.lines, ac.curr] : ac.lines,
      curr: overwidth ? word + " " : line
    }

  }, { lines: [], curr: "" });

  // Add the final line, and draw them
  [...lines.lines, lines.curr].forEach( drawLine );

}

export default wrapText;
