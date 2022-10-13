precision mediump float;

uniform sampler2D texture0; // 通常レンダリング
uniform sampler2D texture1; // postEffectレンダリング
uniform float strength;

varying vec2 vTexCoord;

void main() {
    vec4 texel = vec4(0.0);
    texel  = texture2D(texture0, vTexCoord) * strength;
    texel += texture2D(texture1, vTexCoord);
    gl_FragColor = texel;
}