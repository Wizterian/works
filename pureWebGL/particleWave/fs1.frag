precision mediump float;
varying vec4 vColor;

void main() {
  float circle = length(gl_PointCoord.xy - 0.5);
  if (step(0.5, circle) > 0.0) discard;

  gl_FragColor = vColor;
}

