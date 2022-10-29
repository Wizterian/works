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

    // update
    window.addEventListener('resize', (event) => this._onResize(event));
    this._tick();
  }

  _tick() {
    requestAnimationFrame(() => this._tick());
    this._camera.rotate();
    this._camera.update();

    this._particleEmitter.update();

    this._renderer.render(this._scene, this._camera);
  }

  _onResize(event) {this._resize()};

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
    this._angle -= 0.1;
  }

  update() {
    const lad = (this._angle * Math.PI) / 180;
    this.position.x = this._radius * Math.sin(lad);
    this.position.z = this._radius * Math.cos(lad);
    this.lookAt(new Vector3(0, 1.5, 0));
  }
}
