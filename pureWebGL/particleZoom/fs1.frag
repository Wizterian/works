precision mediump float;

uniform vec4 globalColor;

varying vec4 vColor;
// varying float vIndex;

void main() {
  // Circle
  float circle = length(gl_PointCoord.xy - 0.5); // 中心に移動
  if (step(0.5, circle) > 0.0) discard; // 半分描画
  // vec4 other = vColor;
  // if (vIndex == 1.) other = vec4(1., 0., 0., 1.); // 色デバッグ
  gl_FragColor = globalColor * vColor;
  // gl_FragColor = globalColor * other;
}
