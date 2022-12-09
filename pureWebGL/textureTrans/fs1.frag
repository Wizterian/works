precision mediump float;

uniform float ratio;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform sampler2D textureUnit3;
uniform sampler2D textureUnit4;
uniform vec2 fittingRatio;
uniform float threshold;
uniform float edgeWidth;
uniform float time;

varying vec4 vColor;
varying vec2 vTexCoord;

float easeInOutCirc(float t) {
return t < 0.5
  ? (1. - sqrt(1. - pow(2. * t, 2.))) / 2.
  : (sqrt(1. - pow(-2. * t + 2., 2.)) + 1.) / 2.;
}

mat2 getRotM(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  // // wave with fluid.jpg
  // float intensity = .1;
  // float PI = 3.141592;
  // // float mixStrength = ratio;
  // float mixStrength = (sin(time * 2.) * .5) + .5; // 0 - 1
  // vec2 newUV = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5);

  // // Displacement Map
  // vec4 disp = texture2D(textureUnit4, newUV);
  // // Displacementのrとgを使う
  // vec2 dispVec = vec2(disp.r, disp.g);

  // // UV Displacement
  // vec2 distortedPosition1 = newUV + getRotM(PI) * dispVec * intensity * mixStrength;
  // vec2 distortedPosition2 = newUV + getRotM(PI) * dispVec * intensity * (1.0 - mixStrength);

  // vec4 texture1 = texture2D(textureUnit3, distortedPosition1);
  // vec4 texture2 = texture2D(textureUnit4, distortedPosition2);
  
  // // float r = clamp(mixStrengths, 0.0, 1.0);

  // gl_FragColor = mix(texture1, texture2, mixStrength);



  // square with square.png
  float intensity = .05;
  float PI = 3.141592;
  float mixStrength = (sin(time * 1.5) * .5) + .5;
  vec2 newUV = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5);

  // Displacement
  vec4 displaceMap1 = texture2D(textureUnit3, newUV);

  // // イージング（mixの第3引数）
	// float trans = clamp(1.6  * mixStrength - displaceMap1.r * 0.4 - newUV.x * 0.2, 0.0, 1.0);
	// trans = easeInOutCirc(trans);

  vec2 displaceImg1 = vec2(
    newUV.x + displaceMap1.r * intensity * mixStrength,
    newUV.y + displaceMap1.g * intensity * mixStrength
  );
  vec2 displaceImg2 = vec2(
    newUV.x + displaceMap1.r * intensity * (1.0 - mixStrength),
    newUV.y + displaceMap1.g * intensity * (1.0 - mixStrength)
  );

  gl_FragColor = mix(
    texture2D(textureUnit1, displaceImg1),
    texture2D(textureUnit2, displaceImg2),
    mixStrength
  );



  // // original 2 with hex.png
  // float mixStrength = (sin(time) * .5) + .5;

  // vec2 fittedTexCoord = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5);
  // vec4 samplerColor1 = texture2D(textureUnit1, fittedTexCoord);
  // vec4 samplerColor2 = texture2D(textureUnit2, fittedTexCoord);
  // vec4 displacement = texture2D(textureUnit3, fittedTexCoord);

  // // Clampして使う
  // float r = clamp(mixStrength * 2.0 - displacement.r, 0.0, 1.0);

  // // vec4 blendColor = mix(t1, t2, mixStrength);
  // // vec4 blendColor = mix(samplerColor1, samplerColor2, mixStrength);
  // vec4 blendColor = mix(samplerColor1, samplerColor2, r);
  // gl_FragColor = vColor * blendColor;



  // // Original
  // vec2 fittedTexCoord = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5);

  // // テクスチャから色を読み出す
  // vec4 samplerColor1 = texture2D(textureUnit1, fittedTexCoord);
  // vec4 samplerColor2 = texture2D(textureUnit2, fittedTexCoord);
  // vec4 samplerColor3 = texture2D(textureUnit3, fittedTexCoord);

  // // ３枚目のテクスチャの色はトランジション係数として使う @@@
  // float r = clamp(ratio * 2.0 - samplerColor3.r, 0.0, 1.0);

  // // テクスチャ由来の２つの色を補間する
  // vec4 blendColor = mix(samplerColor1, samplerColor2, r);
  // gl_FragColor = vColor * blendColor;
}

