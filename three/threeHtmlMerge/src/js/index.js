import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
// import { hello } from "./sub";
// hello();

export default class ThreeApp {
  constructor(options) {
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.startTime = Date.now();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 100, 2000);
    this.camera.position.z = 600;
    this.camera.fov = Math.atan((this.height / 2) / 600) * (180 / Math.PI) * 2;

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.loadedShaders = [];
    this.loadedImages = [];
    // 非同期でやったほうが良い
    this.images = [...document.querySelectorAll('img')];

    window.addEventListener('resize', this.resize.bind(this));
  }

  load() {
    const shaderPaths = ['./js/vertex.glsl', './js/fragment.glsl'];
    const shaderPathsRes = shaderPaths.map((path) => {
      return fetch(path)
        .then(response => response.text())
        .then(response => this.loadedShaders.push(response));
    });
  
    const imgPaths = ['../img/thumb1.jpg', '../img/thumb2.jpg'];
    const imgPathRes = imgPaths.map(path => {
      return new Promise(resolve => {
        this.loadedImages.push(new THREE.TextureLoader().load(path));
        resolve(this.loadedImages);
      })
    });

    //　配列で渡さないとダメ、かつpromise.allだとshaderが動かない
    return Promise.all(shaderPathsRes, imgPathRes);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addImages() {
    this.imageStore = this.images.map(img => {
      const bounds = img.getBoundingClientRect();
      const geo = new THREE.PlaneGeometry(bounds.width, bounds.height, 1, 1);
      const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh)
      console.log('geometry: ', geo);
      return {
        img: img,
      }
    })
  }

  setup() {
    this.geometry = new THREE.PlaneGeometry(500, 500, 10, 10);
    // this.geometry = new THREE.SphereGeometry(1, 50, 50);
    this.material = new THREE.MeshNormalMaterial();
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: true,
      vertexShader: this.loadedShaders[0],
      fragmentShader: this.loadedShaders[1],
      uniforms: {
        time: {value: 0},
        oceanTexture: {value: this.loadedImages[0]}
      }
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.currentTime = (Date.now() - this.startTime) / 1000;

    this.mesh.rotation.x = this.currentTime / 2000;
    this.mesh.rotation.y = this.currentTime / 1000;

    this.material.uniforms.time.value = this.currentTime;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

const App = new ThreeApp({container: document.getElementById('container')});
App.load()
.then(() => {
  App.addImages();
  App.resize();
  App.setup();
  App.render();
});

// 前回の課題をPureWebGL（Git）に追加

// Awwward
// boilarPlate作る
// importはwebpackかparcelが必要
// https://teratail.com/questions/157447

// webpackだけののtemplateを作る
// https://ics.media/entry/12140/#webpack-setup

// Webpack + three作る
// 　three import
// 　tutorial code

// document化しておく（Webpackのみ）
// https://docs.google.com/document/d/1XZdK4tYP6R2f8sw2BOQuTUCdq7JhG_HFEQKB_IyIFbo/edit

// awwwardのShaderのところまで最低限やる

// --------------------------------- 済み 

// load function不安定
  // new Promiseの作り方を変更
    // WebGL Schoolと同様に

// HTML Merge