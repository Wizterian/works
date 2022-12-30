attribute vec3 position;
attribute vec4 color;
attribute float time;

uniform vec2 resolution; // 画面サイズ

varying vec4 vColor;
varying vec2 vRes;
varying float vTime;

void main() {
  vColor = color;
  vTime = time;

  gl_Position = vec4(position, 1.0);
  gl_PointSize = 20.0;
}

