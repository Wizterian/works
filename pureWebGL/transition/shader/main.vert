attribute vec3 position;
attribute vec4 color;
attribute vec2 texCoord; // テクスチャ座標 @@@

varying vec4 vColor;
varying vec2 vTexCoord; // テクスチャ座標用 @@@

void main(){
  // 生成した属性を使わないとcompile時消されてwarning
  // https://stackoverflow.com/questions/17313685/webgl-enablevertexattribarray-index-out-of-range
  vColor = color;
  vTexCoord = texCoord;

  // MVP 行列と頂点座標を乗算してから出力する
  gl_Position = vec4(position, 1.0); // 背景画像fit
}