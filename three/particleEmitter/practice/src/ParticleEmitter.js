import {
  Object3D,
  Texture,
  TextureLoader
} from 'three';
import Particle from './Particle';

export default class ParticleEmitter extends Object3D {
  constructor() {
    console.log('ParticleEmitter');
    super();
    this._particleNum = 1;
    this._particleMaxNum = 1;
    this._radius = 5;
    this._angle = 0;
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
      // Particleの位置設定
      particle.init(this._radius, this._angle);
    })

    // maxNumまで10個づつ追加
    if (this.children.length < this._particleMaxNum) {
      for (let i = 0; i < 10; i++) this._addParticle();
    }
  }

  _addParticle() {
    if (!this._texture) return;

    const particle = new Particle(this._texture);
    particle.visible = false;
    this.add(particle);
  }
}

// particleクラス作る
// emitterからparticleをaddする
// particleをmaxNumまで生成
// particleを円柱に並べる
// --- 済み
// isAliveでinitかupdate切り替え

