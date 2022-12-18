attribute vec3 position;
attribute vec4 sqColor;

uniform vec2 resolution; // 画面サイズ

varying vec4 vSqCol;
varying vec4 vRes;

void main() {
  // resolution;
  vSqCol = sqColor;

  gl_Position = vec4(position, 1.0);
  gl_PointSize = 10.0;
}

