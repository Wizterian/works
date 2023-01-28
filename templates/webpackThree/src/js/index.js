import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { hello } from "./sub";
hello();

export default class ThreeApp {
  constructor(options) {
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.startTime = Date.now();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.01, 10);
    this.camera.position.z = 1;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    window.addEventListener('resize', this.resize.bind(this));
  }

  load() {
    const pathArray = [
      './vertex.glsl',
      './fragment.glsl'
    ]
    const shaders = pathArray.map((path) => {
      return fetch(path).then((response) => {return response.text()});
    })
    return Promise.all(shaders);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  setup(shaders) {
    this.geometry = new THREE.PlaneGeometry(0.5, 0.5, 50, 50);
    this.material = new THREE.MeshNormalMaterial();
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: true,
      fragmentShader: shaders[1],
      vertexShader: shaders[0]
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.currentTime = (Date.now() - this.startTime) / 1000;

    this.mesh.rotation.x = this.currentTime / 2000;
    this.mesh.rotation.y = this.currentTime / 1000;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

const App = new ThreeApp({container: document.getElementById('container')});
App.load()
.then(shaders => {
  App.resize();
  App.setup(shaders);
  App.render();
});