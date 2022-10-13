precision mediump float;

uniform vec4 cubeColor;

varying vec4 vColor;

void main(){
  gl_FragColor = cubeColor * vColor;
}

