precision mediump float;

uniform float ratio;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform sampler2D textureUnit3;
uniform vec2 fittingRatio;
uniform float threshold;
uniform float edgeWidth;
uniform float time;

varying vec4 vColor;
varying vec2 vTexCoord;

mat2 getRotM(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  // float intensity = 0.5;
  // float mixStrength = 0.;
  float mixStrength = (sin(time) * .5) + .5;

  // Parttern 2
  vec2 fittedTexCoord = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5);
  vec4 samplerColor1 = texture2D(textureUnit1, fittedTexCoord);
  vec4 samplerColor2 = texture2D(textureUnit2, fittedTexCoord);
  vec4 displacement = texture2D(textureUnit3, fittedTexCoord);

  // Clampして使う
  float r = clamp(mixStrength * 2.0 - displacement.r, 0.0, 1.0);

  vec4 t1= texture2D(
    textureUnit1,
    vec2(
      fittedTexCoord.x,
      fittedTexCoord.y + mixStrength * displacement.r
    )
  );
  vec4 t2 = texture2D(
    textureUnit2,
    vec2(
      fittedTexCoord.x,
      fittedTexCoord.y + (1.0 - mixStrength) * displacement.r
    )
  );

  // vec4 blendColor = mix(t1, t2, mixStrength);
  // vec4 blendColor = mix(samplerColor1, samplerColor2, mixStrength);
  vec4 blendColor = mix(samplerColor1, samplerColor2, r);
  gl_FragColor = vColor * blendColor;


  // // Original
  // vec2 fittedTexCoord = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5);

  // // テクスチャから色を読み出す
  // // vec4 samplerColor1 = texture2D(textureUnit1, fittedTexCoord);
  // // vec4 samplerColor2 = texture2D(textureUnit2, fittedTexCoord);
  // // vec4 samplerColor3 = texture2D(textureUnit3, fittedTexCoord);
  // vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);
  // vec4 samplerColor2 = texture2D(textureUnit2, vTexCoord);
  // vec4 samplerColor3 = texture2D(textureUnit3, vTexCoord);

  // // ３枚目のテクスチャの色はトランジション係数として使う @@@
  // float r = clamp(ratio * 2.0 - samplerColor3.r, 0.0, 1.0);

  // // テクスチャ由来の２つの色を補間する
  // vec4 blendColor = mix(samplerColor1, samplerColor2, r);
  // gl_FragColor = vColor * blendColor;


  // // Test 2
  // float th = threshold;
  // float ew = edgeWidth;
  // th = 0.1;
  // ew = 0.0;
  // float alpha = .99;
  // vec4 edgeColor = vec4(1., 1., 0., 1.);
  // vec4 diffuseColor = vec4( vColor.rgb, alpha );
  // float noize = texture2D(textureUnit3, vTexCoord).r;
  // vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);
  // vec4 samplerColor2 = texture2D(textureUnit2, vTexCoord);
  // if (noize > th) alpha = 0.0;
  // if (noize + ew > th) diffuseColor = edgeColor;
  // vec4 blendColor = mix(samplerColor1, samplerColor2, diffuseColor);

  // gl_FragColor = vec4(blendColor);
}

