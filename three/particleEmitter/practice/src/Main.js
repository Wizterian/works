import {
  Scene,
  WebGLRenderer,
  AxesHelper,
  GridHelper,
  PerspectiveCamera,
  Vector3
} from 'three';
import ParticleEmitter from './ParticleEmitter';

export default class Main {
  constructor() {
    // scene, camera, renderer
    this._scene = new Scene();
    this._camera = new Camera();
    this._renderDom = document.getElementById('renderCanvas');
    this._renderer = new WebGLRenderer({ antialias: true });
    this._renderer.setClearColor(0x000000);
    this._renderer.setPixelRatio(2);
    this._renderDom.appendChild(this._renderer.domElement);
    this._resize();

    // particleEmitter
    this._particleEmitter = new ParticleEmitter();
    this._scene.add(this._particleEmitter);

    // Helper
    const gridHelper = new GridHelper(20, 10, 0xffffff, 0xffffff);
    const axisHelper = new AxesHelper(5);
    this._scene.add(gridHelper, axisHelper);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

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

    this._stats.begin();
    this._renderer.render(this._scene, this._camera);
    this._stats.end();
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

class Camera extends PerspectiveCamera {
  _angle = 0;
  _radius = 25;

  constructor() {
    super(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.position.set(this._radius, 10, 0);
  }

  rotate() {
    this._angle -= 0.1 * TimerModel.getInstance().getTimeRatio();
  }

  update() {
    const lad = (this._angle * Math.PI) / 180;
    this.position.x = this._radius * Math.sin(lad);
    this.position.z = this._radius * Math.cos(lad);
    this.lookAt(new Vector3(0, 1.5, 0));
  }
}

export class TimerModel {  
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
