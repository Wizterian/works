import {
  AdditiveBlending,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from 'three';
import { TimerModel } from './Main';

export default class Particle extends Sprite {
  constructor(texture, color = 0xffffff) {
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
    // Position
    const rad = (angle * Math.PI) / 180;
    this.position.set(
      5 * Math.sin(rad * .3),
      radius * Math.sin(rad),
      radius * Math.cos(rad)
    );

    // Direction to go
    this._pVector = new Vector3(
      Math.random() * (-0.06 - 0.06) + 0.06,
      Math.random() * (0.03 - 0.06) + 0.06,
      Math.random() * (-0.06 - 0.06) + 0.06
    );

    // Scale
    this._pScale = Math.random() * 1.5 + 0.5;
    this.scale.set(
      this._pScale,
      this._pScale,
      this._pScale
    );

    this.material.opacity = 1;
    this.isAlive = true;
    this.visible = true;
    this._lifePoint = 60 * (1 / TimerModel.getInstance().getTimeRatio());
  }

  update() {
    const timeScale = TimerModel.getInstance().getTimeRatio();
    this._lifePoint -= 1;
    this.position.add(this._pVector.clone().multiplyScalar(timeScale));
    this.material.opacity -= 1 / this._lifePoint;
    if(0 >= this._lifePoint) this.isAlive = false;
  }
}
