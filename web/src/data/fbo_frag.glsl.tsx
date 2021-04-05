let frag = `

uniform sampler2D posTex;
uniform float time;
uniform vec2 dims;
uniform vec2 fan_locs[1];
varying vec2 vUv;

void main() {

    vec3 pos = texture2D(posTex, vUv).xyz;

    vec2 fan_loc = fan_locs[0];
    vec3 fan_loc_dir = normalize(pos - vec3(fan_loc, 0.));
    vec3 final_pos = pos + fan_loc_dir * 0.01;

    // render the new positional attributes
    gl_FragColor = vec4(final_pos, 1.0);

}`

export default frag
