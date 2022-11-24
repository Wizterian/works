attribute vec3  position;  // 頂点座標
// attribute vec4  color;     // 頂点色

// uniform   mat4  mvpMatrix; // MVP 座標変換行列
uniform mat4  mMatrix; // MVP 座標変換行列
uniform float time;      // 時間の経過（秒）
uniform vec2  resolution;
uniform vec4  color;

varying   vec4  vColor;

void main() {
  // 頂点カラーをそのまま出力する色に使う
  vColor = color; // vec4(1., 1., 1., 1.);

  // // アス比維持して背景全体にフィット
  // vec2 ratio = vec2(
  //   max(1.0 / (resolution.x / resolution.y), 1.0),
  //   max(1.0 / (resolution.y / resolution.x), 1.0)
  // );
  // vec3 tmpPos = position * vec3(ratio, 0.0);

  // X 座標に応じて波打つような変形処理を行うためにサインの値を算出 @@@
  // float s = sin(time + position.x) * wave;
  // float s = sin((time * (groupIndex * 0.1 + 1.)) + position.y);

  // 求めたサインの値を頂点座標に足し込む
  // vec3 p = tmpPos + vec3(0., 0., 0.);
  vec3 p = position;

  // JavaScript 側で生成した行列と頂点座標を乗算
  // gl_Position = mvpMatrix * vec4(p, 1.0);
  gl_Position = vec4(p, 1.0) * mMatrix;
  // gl_Position = vec4(p, 1.0);

  // 頂点が描かれるサイズ
  // gl_PointSize = size;
  gl_PointSize = 5.;
}
