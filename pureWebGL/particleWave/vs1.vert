attribute vec3  positionA;
attribute vec3  positionB;

// uniform   mat4  mvpMatrix; // MVP 座標変換行列
uniform mat4  mMatrix;
uniform float time;
uniform vec2  resolution;
uniform vec4  color;
uniform float  strength; // Mix強度

varying   vec4  vColor;

void main() {
  vColor = color;

  // アス比維持して背景全体にフィット
  vec2 ratio = vec2(
    max(1.0 / (resolution.x / resolution.y), 1.0),
    max(1.0 / (resolution.y / resolution.x), 1.0)
  );
  // 先にアスペクト比をかけるのは不可
  vec3 tmpPosA = positionA * vec3(ratio, 0.0);
  vec3 tmpPosB = positionB * vec3(ratio, 0.0);
  vec3 newPosition = mix(tmpPosA, tmpPosB, strength);

  // なんらかアスペクト比変更用の行列が必要? ← JSのmat4.scaleでやる
  // mat4 newModelMatrix = mMatrix;
  // mat4 matRatio = [
  //   1.,  0.,  0.,  0.,
  //   1.,  0.,  0.,  0.,
  //   1.,  0.,  0.,  0.,
  //   1.,  0.,  0.,  0.
  // ];
  // newModelMatrix = newModelMatrix * mat4(1.0);

  // JavaScript 側で生成した行列と頂点座標を乗算
  gl_Position = vec4(newPosition, 1.0) * mMatrix;

  // 頂点が描かれるサイズ
  gl_PointSize = 4.;
}
