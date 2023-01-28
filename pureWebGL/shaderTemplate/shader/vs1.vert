attribute vec3 position;
attribute vec4 color;
attribute float time;

uniform vec2 resolution; // 画面サイズ

varying vec4 vColor;
varying vec4 vRes;

void main() {
  vColor = color;

  gl_Position = vec4(position, 1.0);
  gl_PointSize = 10.0;
}

