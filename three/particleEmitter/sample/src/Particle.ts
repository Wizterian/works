import {
  AdditiveBlending,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from 'three';

export default class Particle extends Sprite {
  /** フレーム毎にカウントされる値です。 */
  private _counter: number = 0;
  /** パーティクルの速度です。 */
  private _velocity: Vector3 | null = null;
  /** ライフポイント */
  private _lifePoint: number | null = null;
  /** 生きているかどうか */
  public isAlive: Boolean = false;
  /** カウントのインクリメント数 */
  private _incrementCountNum?: number;
  /** 最大スケール */
  private _maxScale: number | null = null;
  public pScale: number | null = 0;

  constructor(texture: Texture, color: number = 0x88ccff) {
    super(
      // particle スプライト
      new SpriteMaterial({
        color: color,
        map: texture,
        transparent: true,
        blending: AdditiveBlending,
      })
    );
  }

  // 位置をリセット
  public init(radius: number, angle: number) {
    const rad = (angle * Math.PI) / 180;
    // 円・上下移動
    const x = radius * Math.sin(rad);
    const y = 4 * Math.sin(rad * 0.3);
    const z = radius * Math.cos(rad);
    this.position.set(x, y, z);
    // ランダム設定
    this._maxScale = Math.random() * 1.5 + 0.5; // 最大スケール値ランダム（0.5 - 2.0）
    this.scale.set(this._maxScale, this._maxScale, this._maxScale); // スケール
    this._velocity = new Vector3( // 上昇傾向の外向き移動
      Math.random() * (-0.07 - 0.07) + 0.07,
      Math.random() * (0.03 - 0.08) + 0.08,
      Math.random() * (-0.07 - 0.07) + 0.07
    );
    this.material.opacity = 1; // リセット後表示
    this.isAlive = true; // リセット後再生フラグ
    this._lifePoint = Math.random() * 50 + 10; // 10〜60フレームのライフ
    this._incrementCountNum = Math.random() * 0.5 + 0.2; // 0.2〜0.7のインクリメント増減値
    // ライフのタイマーリセット
    this._counter = 0;
  }

  // 移動とアニメーション
  public update() {
    // 設定が（一つでも）なければ実行しない
    if (this._incrementCountNum == null) return;
    if (this._velocity == null) return;
    if (this._maxScale == null) return;
    if (this._lifePoint == null) return;

    const timeRatio = 1; // パーティクル移動スピード係数

    // アニメーション
    this._counter += this._incrementCountNum * timeRatio; // カウンターインクリメント
    this.position.add(this._velocity.clone().multiplyScalar(timeRatio)); // 拡散アニメ
    this.material.opacity -= 0.009 * timeRatio; // 透明度アニメ（消えていく）

    // ライフなくなれば死亡フラグ
    if (this._lifePoint < this._counter) this.isAlive = false;
  }
}
