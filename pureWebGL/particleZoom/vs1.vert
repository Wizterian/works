attribute vec3  position;
attribute vec4  color;
attribute float size;
attribute float random;
attribute float direction;

uniform float  time;
uniform vec2  resolution;
uniform vec2 mouse;

varying vec4  vColor;

void main() {
  vColor = color;
  float rad = 3.14 * 2.;

  // アス比維持して背景全体にフィット
  vec2 ratio = vec2(
    max(1.0 / (resolution.x / resolution.y), 1.0),
    max(1.0 / (resolution.y / resolution.x), 1.0)
  );
  vec3 tmpPos = position * vec3(ratio, 0.0);

  // 個々の軽微な動き(sin(時間 + 初期ラジアン角) * 振幅の強さ)
  tmpPos.x += (sin((time * random) + (rad * random))) * (0.01 * random);
  tmpPos.y += ((cos((time * (1.25 * random)) + (rad * random))) * (0.01 * random)) * direction;

  // アス比で見切れたマウス座標をウィンドウに合わせ距離算出
  float mouseToPoint = length(position.xy - vec2(mouse.x * ( 1. / ratio.x), mouse.y * ( 1. / ratio.y))); 

  // パーティクルのスケーリング
  float pScale = max(resolution.x / 1000., resolution.y / 1000.); // 基本サイズ
  pScale += smoothstep(0.4, 0., mouseToPoint) * min(ratio.x, ratio.y) * 3.; // マウス座標に応じ拡大

  gl_Position = vec4(tmpPos, 1.0);
  gl_PointSize = size * pScale;
}

