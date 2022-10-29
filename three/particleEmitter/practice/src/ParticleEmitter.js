import {
  Object3D,
  Texture,
  TextureLoader
} from 'three';
import Particle from './Particle';

export default class ParticleEmitter extends Object3D {
  constructor() {
    super();
    this._particleAddNum = 1;
    this._particleMaxNum = 110;
    this._radius = 5;
    this._angle = 0;
    this._colorList = [0x88ffcc, 0xccffcc, 0x33ffcc];
    const loader = new TextureLoader();

    // texture
    loader.load('./particle.png', (texture) => {
      this._texture = texture;
    });
  }

  update() {
    if (!this._texture) return;

    const incrementNumber = 7;
    this._angle += incrementNumber;

    const items = this.children;
    // particleを並べる
    items.forEach((particle, index) => {
      if (particle.isAlive) {
        // particleを再生
        particle.update();
      } else {
        // particleを巻き戻し
        particle.init(this._radius, this._angle);
      }
    })

    // 最大生成数に達するまでn個づつ追加
    if (this.children.length < this._particleMaxNum) {
      for (let i = 0; i < this._particleAddNum; i++) this._addParticle();
    }
  }

  _addParticle() {
    if (!this._texture) return;
    const color = this._colorList[Math.floor(Math.random() * 3)]
    const particle = new Particle(this._texture, color);
    this.add(particle);
  }
}

// particleクラス作る
// emitterからparticleをaddする
// particleをmaxNumまで生成
// particleを円柱に並べる
// isAliveでinitかupdate切り替え
// particle個別の動き
// 生成数を増やす
// 不要 particleずらし
// --- 済み
// lifeと発生個数のバランス取る
// bufferGeometryでやる
