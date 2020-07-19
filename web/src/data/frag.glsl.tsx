let frag = `
varying vec2 vUv;
uniform sampler2D mapping;
uniform vec2 fan_locs[2];
uniform vec2 fan_powers[2];

void main(){
  gl_FragColor = texture2D(mapping, vUv + 0.5 * fan_locs[0]);
}`

export default frag