import * as THREE from 'three'

export default class Main {
  constructor() {
    // scene, camera, renderer
    this._scene = new THREE.Scene();
    this._camera = new Camera();
    this._renderDom = document.getElementById('renderCanvas');
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setClearColor(0x000000);
    this._renderer.setPixelRatio(2);
    this._renderDom.appendChild(this._renderer.domElement);
    this._resize();

    // particleEmitter
    this._particleEmitter = new ParticleEmitter();
    this._scene.add(this._particleEmitter);

    // Helper
    const gridHelper = new THREE.GridHelper(20, 10, 0xffffff, 0xffffff);
    const axisHelper = new THREE.AxesHelper(5);
    this._scene.add(gridHelper, axisHelper);

    // // Stats
    // this._stats = new Stats();
    // document.body.appendChild(this._stats.dom);

    // update
    this.currentTime = 0;
    this.timeRatio = 1;
    window.addEventListener('resize', event => {this._resize()});
    this._tick();
  }

  _tick() {
    requestAnimationFrame(() => this._tick());
    this._camera.rotate();
    this._camera.update();

    TimerModel.getInstance().updateTimeRatio();
    this._particleEmitter.update();

    // this._stats.begin();
    this._renderer.render(this._scene, this._camera);
    // this._stats.end();
  }

  _resize() {
    const width = this._renderDom.clientWidth;
    const height = this._renderDom.clientHeight;
    this._renderer.domElement.setAttribute('width', String(width));
    this._renderer.domElement.setAttribute('height', String(height));
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }
}

class Camera extends THREE.PerspectiveCamera {
  _angle = 0;
  _radius = 25;

  constructor() {
    super(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.position.set(this._radius, 10, 0);
  }

  rotate() {
    this._angle += 0.1 * TimerModel.getInstance().getTimeRatio();
  }

  update() {
    const lad = (this._angle * Math.PI) / 180;
    this.position.x = this._radius * Math.sin(lad);
    this.position.y = (this._radius / 10) * Math.cos(lad * 4) + (this._radius / 4);
    this.position.z = this._radius * Math.cos(lad);
    this.lookAt(new THREE.Vector3(0, 1.5, 0));
  }
}

class TimerModel {  
  constructor() {
    this._currentTime = 0;
    this._timeRatio = 1;
    TimerModel._instance = this;
  }

  static getInstance() {
    return TimerModel._instance || new TimerModel();
  }

  getTimeRatio() {
    return this._timeRatio;
  }

  updateTimeRatio() {
    const lastTime = this._currentTime;
    const fps60 = 1000 / 60;
    const timeDiff = new Date().getTime() - lastTime;
    this._timeRatio = Math.round((timeDiff / fps60 * 10) / 10) >= 2 ? 2 : 1;
    this._currentTime = new Date().getTime();
  }
}

class ParticleEmitter extends THREE.Object3D {
  constructor() {
    super();
    this._pEmitNum = 2; // Particle number to put in one frame
    this._pMaxNum = 300; // Max particle number to generate
    this._radius = 5;
    this._angle = 0;
    this._colorList = [0x99ffcc, 0xccff99, 0xffffde];
    const loader = new THREE.TextureLoader();

    // texture
    loader.load(document.querySelector("#pImg").src, (texture) => {
      this._texture = texture;
    });
  }

  update() {
    if (!this._texture) return;

    // Framerate adjustment when the fps changes
    const timeScale = TimerModel.getInstance().getTimeRatio();

    // Angle to add in one frame
    const angleIncrement = 5 * timeScale;
    this._angle += angleIncrement;

    // Max particle number when the fps changes
    const tmpMaxNum = this._pMaxNum * (1 / timeScale);
    const tmpEmitNum = this._pEmitNum * timeScale;

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

class Particle extends THREE.Sprite {
  constructor(texture, color = 0xffffff) {
    super(
      new THREE.SpriteMaterial({
        color: color,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
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
    this._pVector = new THREE.Vector3(
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
    this._lifePoint = 80 * (1 / TimerModel.getInstance().getTimeRatio());
  }

  // Particle moves until it's life ends
  update() {
    const timeScale = TimerModel.getInstance().getTimeRatio();
    this._lifePoint -= 1;
    this.position.add(this._pVector.clone().multiplyScalar(timeScale));
    this.material.opacity -= 1 / this._lifePoint;
    if(0 >= this._lifePoint) this.isAlive = false;
  }
}

// cdnない stats.jsをcdnに
// --- 済み
// codepen用に画像を外部に置く
//  https://codepen.io/hisamikurita/pen/JjJpKdZ?editors=0010
//  https://note.com/siouxcitizen/n/n7e6ab421a17f
// bufferGeometry + shaderでやる
