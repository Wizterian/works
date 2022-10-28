import {
  AdditiveBlending,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from 'three';

export default class Particle extends Sprite {
  constructor(texture, color = 0x88ccff) {
    console.log('Particle');
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

  init(radius, angle) {
    const rad = (angle * Math.PI) / 180;
    this.position.set(
      radius * Math.sin(rad),
      5 * Math.sin(rad * .3),
      radius * Math.cos(rad),
    );
    this.visible = true;
  }

  update() {
    // console.log('prticle.update');
  }
}
