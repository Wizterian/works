
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;

uniform mat4 mvpMatrix;
uniform mat4 normalMatrix;
uniform vec3 lightVector;
uniform vec4 ambientLight;
uniform int normalVisibility;

varying vec4 vColor;

void main(){
  // 法線をまず行列で変換する @@@
  /************************************
  他の座標更新に合わせて法線を更新
  */
  vec3 n = (normalMatrix * vec4(normal, 0.0)).xyz;
  // 変換した法線とライトベクトルで内積を取る @@@
  /************************************
  単位化した方向(dot)で光源をシミュレート（-1〜+1）
  clampは範囲内に丸める関数
  */
  float d = clamp(dot(normalize(n), normalize(lightVector)), 0.5, 1.0);
  // 内積の結果を頂点カラーのRGB成分に乗算する
  if (normalVisibility == 1) {
    vColor = vec4(color.rgb * d, color.a) + ambientLight;
  } else {
    vColor = vec4(color.rgb, color.a) + ambientLight;
  }

  // 座標変換
  gl_Position = mvpMatrix * vec4(position, 1.0);
}
