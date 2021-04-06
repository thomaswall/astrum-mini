let frag = `
precision highp float;

uniform sampler2D posTex;
uniform float time;
uniform vec2 dims;
uniform vec2 fan_locs[4];
uniform float fan_powers[4];
varying vec2 vUv;

void main() {

    vec3 pos = texture2D(posTex, vUv).xyz;


    vec3 final_pos = pos;
    for(int i = 0; i < 4; i++) {
        vec2 fan_loc = fan_locs[i];
        vec3 dir = pos - vec3(fan_loc, 0.);
        float dist = length(dir);
        vec3 fan_loc_dir = normalize(dir);
        float fan_power = fan_powers[0];
        float power_multiple = (1.0 / (dist / fan_power));

        final_pos +=  fan_loc_dir * power_multiple * 0.0002;
    }
    
    float t = time * 0.00005;
    gl_FragColor = vec4(final_pos, 1.0);

}`

export default frag
