import Stats from "stats-js";

const s = new Stats();
const dom = s.domElement;
const style = dom.style;
s.setMode( 0 );
style.position = "absolute";
style.left = "0px";
style.top = "0px";
document.body.appendChild( dom );

export default () => s;
