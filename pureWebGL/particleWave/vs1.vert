attribute vec3  positionA;
attribute vec3  positionB;

uniform mat4  mvpMatrix;
uniform float time;
uniform vec2  ratioToFit;
uniform vec4  color;
uniform float  strength; // Mix強度

varying   vec4  vColor;

void main() {
  vColor = color;

  // アス比維持して背景全体にフィット
  // vec3 newPosition = mix(positionA, positionB, strength) * vec3(ratioToFit, 1.0);
  vec3 newPosition = mix(positionA, positionB, strength);

  // JavaScript 側で生成した行列と頂点座標を乗算
  gl_Position = vec4(newPosition, 1.0) * mvpMatrix;

  // 頂点が描かれるサイズ
  gl_PointSize = 4.;
}
