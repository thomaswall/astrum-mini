let vert = `
varying vec2 vUv;
uniform sampler2D mapping;
uniform vec2 dims;
attribute vec3 index;
attribute float pindex;

void main(){
  vUv = vec2(floor(pindex / dims.x), mod(pindex, dims.x));
  vec4 offset = texture2D(mapping, vUv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset.xyz, 1.0);
}`

export default vert