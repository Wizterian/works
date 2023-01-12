
attribute vec3 positionA;
attribute vec3 normalA;
// attribute vec4 colorA;

attribute vec3 positionB;
attribute vec3 normalB;
// attribute vec4 colorB;

attribute vec3 positionC;
attribute vec3 normalC;
// attribute vec4 colorB;

// uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
// uniform vec3 lightVector;
// uniform vec4 ambientLight;
uniform vec4 csColorA;
uniform vec4 csColorB;
uniform float time;
uniform float ratio;

// Mix Strength
uniform float transStrength_1;
uniform float transStrength_2;
uniform float transStrength_3;

varying vec4 vColor;

void main(){
  // to Escape Warning
  normalMatrix;
  // positionA;
  normalA;
  // colorA;
  // positionB;
  normalB;
  // colorB;
  // positionC;
  normalC;
  // colorC;

  // vec3 n = (normalMatrix * vec4(normal, 0.0)).xyz;
  /************************************
  ・変換した法線とライトベクトルで内積を取る
  ・単位化した方向(dot)で光源をシミュレート（-1〜+1）
  ・clampは範囲内に丸める関数
  */
  // float d = clamp(dot(normalize(n), normalize(lightVector)), 0.5, 1.0); // no light vec

  // 内積の結果を頂点カラーのRGB成分に乗算する
  // vColor = vec4(colorA.rgb * d, colorA.a) + ambientLight; // no ambient light

  // new new line ------------------------------

  vec3 newPosA = positionA * transStrength_1;
  vec3 newPosB = positionB * transStrength_2;
  vec3 newPosC = positionC * transStrength_3;
  vec3 newPosFin = newPosA + newPosB + newPosC;

  // new line ------------------------------

  // Color
  vColor = mix(csColorA, csColorB, ratio);
  // vColor = vec4(1., 1., ratio, 1.);
  // vColor = colorA;

  // 座標MIX
  vec3 interpolated = mix(positionA, positionB, ratio);
  // Y 座標に応じて波打つような変形処理を行うためにサインの値を算出
  float s = sin(time + interpolated.y) * .1;
  vec3 p = interpolated + normalize(interpolated) * s;

  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;

  // 座標変換
  // gl_Position = mvpMatrix * vec4(interpolated, 1.0);
  gl_Position = mvpMatrix * vec4(newPosFin, 1.0);
}
