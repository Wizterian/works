import {
  Object3D,
  Texture,
  TextureLoader
} from 'three';
import Particle from './Particle';
import {TimerModel} from './Main';

export default class ParticleEmitter extends Object3D {
  constructor() {
    super();
    this._pEmitNum = 3; // Particle number to put in one frame
    this._pMaxNum = 500; // Max particle number to generate
    this._radius = 5;
    this._angle = 0;
    this._colorList = [0x99ffcc, 0xccff99, 0xffffde];
    const loader = new TextureLoader();

    // texture
    loader.load('./particle.png', (texture) => {
      this._texture = texture;
    });
  }

  update() {
    if (!this._texture) return;

    // Framerate adjustment when the fps changes
    const timeRatio = TimerModel.getInstance().getTimeRatio();

    // Angle to add in one frame
    const angleIncrement = 8 * timeRatio;
    this._angle += angleIncrement;

    // Max particle number when the fps changes
    const tmpMaxNum = this._pMaxNum * (1 / timeRatio);
    const tmpEmitNum = this._pEmitNum * timeRatio;

    // Particle actions
    const items = this.children;
    let pEmitIndex = 0; // Particle index for multiple particles at one frame
    items.forEach((particle, index) => {
      if (particle.isAlive) {
        // Particle animation
        particle.update();
      } else {
        // Particle initial position
        particle.init(
          this._radius,
          // Particle delay
          this._angle - ((angleIncrement / tmpEmitNum) * pEmitIndex)
        );
        pEmitIndex += 1;
      }
    })

    // Additional particles until reaching to the maximum number
    if (this.children.length < tmpMaxNum) {
      for (let i = 0; i < tmpEmitNum; i++) {
        this._addParticle();
      }
    }
  }

  _addParticle() {
    if (!this._texture) return;
    const color = this._colorList[Math.floor(Math.random() * 3)]
    const particle = new Particle(this._texture, color);
    particle.visible = false;
    this.add(particle);
  }
}

// --- 済み
// bufferGeometry + shaderでやる
