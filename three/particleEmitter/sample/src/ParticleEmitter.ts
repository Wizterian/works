import {
  Object3D,
  Texture,
  TextureLoader
} from 'three';
import Particle from './Particle';

export default class ParticleEmitter extends Object3D {
  private _texture?: Texture;
  private _particleNum: number; // パーティクル表示数上限
  private _particleMaxNum: number; // パーティクル生成数上限
  private _angle: number = 0; // 次のパーティクルを生成するEmit角度？
  private _radius: number = 5; // emitterの半径
  private _colorList: number[] = [0x88ccff, 0xffffdd, 0x44eeff]; // 色

  constructor() {
    super();
    this._particleNum = 500;
    this._particleMaxNum = 8000;
    // テクスチャ準備
    const loader = new TextureLoader();
    loader.load('./assets/texture/particle.png', (texture: Texture) => {
      this._texture = texture;
    });
  }

  // パーティクルのEmit、（再）利用、追加
  public update() {
    // テクスチャが用意できていなければ処理しない（非同期処理を待ち）
    if (!this._texture) return;

    // particleをEmitする角度7づつたす
    const incrementNumber = 7;
    this._angle += incrementNumber;
    // 死んだパーティクル数初期化
    let notAliveNum = 0;
    // パーティクル要素配列
    const items = this.children as Particle[];
    // 死んだパーティクルカウント
    items.forEach(particle => {
      if (!particle.isAlive) notAliveNum++
    });
    // パーティクル再生数初期化
    let initNum = 0;
    // パーティクル生死判定
    items.forEach((particle, index) => {
      if (particle.isAlive) { // 生きていれば
        particle.update(); // particleアニメーション
      } else { // 死んでいれば
        particle.init( // particleの位置リセット
          this._radius,
          // (角度 7倍数) - (7 / 死んだパーティクル数) * パーティクル再生数
          // ずらしておいていく？
          // this._angle - (incrementNumber / notAliveNum) * initNum
          this._angle
        );
        initNum++; // パーティクル再生数インクリメント
      }

      // 表示するパーティクルの割合
      const perLength = Math.floor(this._particleMaxNum / this._particleNum);
      particle.visible = index % perLength === 0 ? true : false;
    });

    // 最大数より生成数が小さければ10個追加生成
    if (this.children.length < this._particleMaxNum) {
      for (let i = 0; i < 10; i++) this._addParticle();
    }
  }

  // パーティクル追加
  private _addParticle(): void {
    // パーティクル最大数超えてるかテクスチャ準備できていなければ何もしない
    if (this.children.length > this._particleMaxNum) return;
    if (!this._texture) return;

    // ランダム色設定
    const color = this._colorList[Math.floor(Math.random() * 3)];

    // パーティクルインスタンス化
    const particle = new Particle(this._texture, color);
    particle.visible = false;
    this.add(particle);
  }
}
