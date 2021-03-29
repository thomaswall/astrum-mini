let frag = `
uniform sampler2D posTex;
uniform vec2 dims;
varying vec2 vUv;

void main() {

    // read the supplied x,y,z vert positions
    vec3 pos = texture2D(posTex, vUv).xyz;

    // update the positional attributes here!
    // pos.x += cos(pos.y) / 100.0;
    // pos.y += tan(pos.x) / 100.0;

    // render the new positional attributes
    gl_FragColor = vec4(pos, 1.0);

}`

export default frag
