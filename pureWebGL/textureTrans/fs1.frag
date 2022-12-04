precision mediump float;
uniform float ratio;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform sampler2D textureUnit3;
varying vec4 vColor;
varying vec2 vTexCoord;

void main() {
  // テクスチャから色を読み出す
  vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);
  vec4 samplerColor2 = texture2D(textureUnit2, vTexCoord);
  vec4 samplerColor3 = texture2D(textureUnit3, vTexCoord);

  // ３枚目のテクスチャの色はトランジション係数として使う @@@
  float r = clamp(ratio * 2.0 - samplerColor3.r, 0.0, 1.0);

  // テクスチャ由来の２つの色を補間する
  vec4 blendColor = mix(samplerColor1, samplerColor2, r);
  gl_FragColor = vColor * blendColor;
}

