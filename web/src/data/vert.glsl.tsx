let vert = `
uniform sampler2D mapping;
uniform vec2 dims;
uniform vec2 screen;
attribute float pindex;

void main(){
  vec2 vUv = vec2(mod(float(pindex), dims.x), floor(float(pindex) / dims.x)) / dims.x;
  vec2 offset = texture2D(mapping, vUv).xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(offset * 5000.0, 0.0) - vec3(screen, 0.0), 1.0);
}`

export default vert
