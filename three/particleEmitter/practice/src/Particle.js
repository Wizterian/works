import {
  AdditiveBlending,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from 'three';

export default class Particle extends Sprite {
  constructor(texture, color = 0x88ccff) {
    super(
      new SpriteMaterial({
        color: color,
        map: texture,
        transparent: true,
        blending: AdditiveBlending,
      })
    );
  }

  init(radius, angle) {
    // 現在の排出座標に設定
    const rad = (angle * Math.PI) / 180;
    this.position.set(
      5 * Math.sin(rad * .3),
      radius * Math.sin(rad),
      radius * Math.cos(rad),
    );
    
    // 拡散
    this._pVector = new Vector3(
      Math.random() * (-0.06 - 0.06) + 0.06,
      Math.random() * (0.03 - 0.06) + 0.06,
      Math.random() * (-0.06 - 0.06) + 0.06
    );
    // スケール
    this._pScale = Math.random() * 1.5 + 0.5;
    this.scale.set(
      this._pScale,
      this._pScale,
      this._pScale
    );

    this.material.opacity = 1;
    this.isAlive = true;
    this._lifePoint = 120; // (Math.random() * 120 - 60) + 60;
  }

  update() { // 4Kには要timeScale
    this._lifePoint -= 1;
    this.position.add(this._pVector);
    this.material.opacity -= 1 / this._lifePoint;
    if(0 >= this._lifePoint) this.isAlive = false;
  }
}
