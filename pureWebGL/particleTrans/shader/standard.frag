precision mediump float;

// uniform vec4 ballColor;

varying vec4 vColor;

void main(){
  // gl_FragColor = ballColor * vColor;
  gl_FragColor = vColor;
}
