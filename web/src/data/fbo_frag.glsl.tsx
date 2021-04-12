let frag = `
precision highp float;

const int NUM_FANS = 20;

uniform sampler2D posTex;
uniform float time;
uniform vec2 dims;
uniform vec2 fan_locs[NUM_FANS];
uniform float fan_powers[NUM_FANS];
uniform vec2 fan_directions[NUM_FANS];
varying vec2 vUv;

void main() {

    vec3 pos = texture2D(posTex, vUv).xyz;


    vec3 final_pos = pos;
    for(int i = 0; i < NUM_FANS; i++) {
        vec2 fan_loc = fan_locs[i];
        vec3 dir = pos - vec3(fan_loc, 0.);
        float dist = length(dir);
        vec3 fan_loc_dir = normalize(dir);
        float fan_power = fan_powers[i];
        float power_multiple = (1.0 / (dist / fan_power));

        vec2 fan_direction = normalize(fan_directions[i]);

        float direction = dot(fan_directions[i], fan_loc_dir.xy);

        final_pos +=  fan_loc_dir * power_multiple * direction * 0.005;
    }
    
    //float t = time * 0.00005;

    final_pos = max(min(final_pos, 1.0), 0.0);
    gl_FragColor = vec4(final_pos, 1.0);

}`

export default frag
