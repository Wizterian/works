attribute vec3 positionA;
attribute vec3 positionB;

uniform mat4 mvpMatrix;
uniform float time;
uniform vec4 color;
uniform float strength;

varying vec4 vColor;

void main() {
  vColor = color;

  // Mixing A with B
  vec3 newPosition = mix(positionA, positionB, strength);

  gl_Position = vec4(newPosition, 1.0) * mvpMatrix;
  gl_PointSize = 4.;
}
