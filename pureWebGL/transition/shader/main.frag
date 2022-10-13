precision mediump float;

// sampler2Dはテクスチャユニットにアクセスできる変数
uniform sampler2D texture0; // 画像1
uniform sampler2D texture1; // 画像2
uniform float elapsedTime; // 時間
uniform vec2 fittingRatio;

// varying vec4 vColor; // 未使用
varying vec2 vTexCoord; // テクスチャ座標 @@@

void main(){
  float intensity = 0.5;

  /*****************************************
    * 3. 背景にfitするようuvを更新?
    * vTexCoord - vec2(0.5) = 中心座標（Vertex座標）系に変換?
    * * vec2(fittingRatio.xy) = fitする比率を乗算
    * + vec2(0.5) = uv座標系に再変換?
  *****************************************/

  vec2 fittedTexCoord = (vTexCoord - vec2(0.5)) * vec2(fittingRatio.xy) + vec2(0.5); // centering
  // vec2 fittedTexCoord = (vTexCoord * fittingRatio + (1.0 - fittingRatio) * 0.5);

  // displacement用テクスチャ生成
  vec4 d0 = texture2D(texture0, fittedTexCoord);
  vec4 d1 = texture2D(texture1, fittedTexCoord);

  // テクスチャのRGB（輝度）総計から乱数生成（正規化）しdisplacement値取得
  float displace0 = (d0.r + d0.g + d0.b) * 0.33;
  float displace1 = (d1.r + d1.g + d1.b) * 0.33;

  // t0（現在写真）は時間経過で通常画像 → displacement画像へ
  vec4 t0= texture2D(
    texture0,
    vec2(
      fittedTexCoord.x + elapsedTime * (displace1 * intensity),
      fittedTexCoord.y
    )
  );
  // t1（次の写真）は時間経過でdisplacement画像 → 通常画像へ
  vec4 t1 = texture2D(
    texture1,
    vec2(
      fittedTexCoord.x + (1.0 - elapsedTime) * (displace0 * intensity),
      fittedTexCoord.y
    )
  );

  // 時間経過でt0 → t1になるよう色を混合
  gl_FragColor = mix(t0, t1, elapsedTime);
}
