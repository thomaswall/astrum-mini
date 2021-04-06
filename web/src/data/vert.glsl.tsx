let vert = `
precision highp float;

uniform sampler2D mapping;
uniform vec2 dims;
uniform vec2 screen;
attribute float pindex;

void main(){
  vec2 vUv = vec2(mod(float(pindex), dims.x), floor(float(pindex) / dims.x)) / dims.x;
  vec2 offset = texture2D(mapping, vUv).xy * screen - screen / 2.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(offset, -3.0), 1.0);
}`

export default vert
