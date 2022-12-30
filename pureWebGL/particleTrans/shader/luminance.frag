precision mediump float;

uniform sampler2D textureUnit;
uniform float minLuminance;

varying vec2 vTexCoord;

void main(){
  // オフスクリーンレンダリングの結果をまず取り出す
  vec4 samplerColor = texture2D(textureUnit, vTexCoord);

  // 例.しきい値 0.5で、R値 0.8の場合、0.8 - 0.5 = 0.3 となり相対的に明るいところだけが残る
  // ※ max関数は0以下になった場合 0.0にする Clampでもいけそう
  vec3 texel = max(vec3(0.0), (samplerColor - minLuminance).rgb);
  
  gl_FragColor = vec4(texel, samplerColor.a);
}
