/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Entry.js":
/*!**********************!*\
  !*** ./src/Entry.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Main */ \"./src/Main.js\");\n\n\nclass Entry {\n  constructor() {\n    new _Main__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n  }\n}\n\nwindow.addEventListener('DOMContentLoaded', () => new Entry());\n\n\n//# sourceURL=webpack:///./src/Entry.js?");

/***/ }),

/***/ "./src/Main.js":
/*!*********************!*\
  !*** ./src/Main.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Main)\n/* harmony export */ });\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\nclass Main {\n  constructor() {\n    // scene, camera, renderer\n    this._scene = new three__WEBPACK_IMPORTED_MODULE_0__.Scene();\n    this._camera = new Camera();\n    this._renderDom = document.getElementById('renderCanvas');\n    this._renderer = new three__WEBPACK_IMPORTED_MODULE_0__.WebGLRenderer({ antialias: true });\n    this._renderer.setClearColor(0x000000);\n    this._renderer.setPixelRatio(2);\n    this._renderDom.appendChild(this._renderer.domElement);\n    this._resize();\n\n    // particleEmitter\n    this._particleEmitter = new ParticleEmitter();\n    this._scene.add(this._particleEmitter);\n\n    // Helper\n    const gridHelper = new three__WEBPACK_IMPORTED_MODULE_0__.GridHelper(20, 10, 0xffffff, 0xffffff);\n    const axisHelper = new three__WEBPACK_IMPORTED_MODULE_0__.AxesHelper(5);\n    this._scene.add(gridHelper, axisHelper);\n\n    // // Stats\n    // this._stats = new Stats();\n    // document.body.appendChild(this._stats.dom);\n\n    // update\n    this.currentTime = 0;\n    this.timeRatio = 1;\n    window.addEventListener('resize', event => {this._resize()});\n    this._tick();\n  }\n\n  _tick() {\n    requestAnimationFrame(() => this._tick());\n    this._camera.rotate();\n    this._camera.update();\n\n    TimerModel.getInstance().updateTimeRatio();\n    this._particleEmitter.update();\n\n    // this._stats.begin();\n    this._renderer.render(this._scene, this._camera);\n    // this._stats.end();\n  }\n\n  _resize() {\n    const width = this._renderDom.clientWidth;\n    const height = this._renderDom.clientHeight;\n    this._renderer.domElement.setAttribute('width', String(width));\n    this._renderer.domElement.setAttribute('height', String(height));\n    this._renderer.setSize(width, height);\n    this._camera.aspect = width / height;\n    this._camera.updateProjectionMatrix();\n  }\n}\n\nclass Camera extends three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera {\n  _angle = 0;\n  _radius = 25;\n\n  constructor() {\n    super(45, window.innerWidth / window.innerHeight, 1, 1000);\n    this.position.set(this._radius, 10, 0);\n  }\n\n  rotate() {\n    this._angle += 0.1 * TimerModel.getInstance().getTimeRatio();\n  }\n\n  update() {\n    const lad = (this._angle * Math.PI) / 180;\n    this.position.x = this._radius * Math.sin(lad);\n    this.position.y = (this._radius / 10) * Math.cos(lad * 4) + (this._radius / 4);\n    this.position.z = this._radius * Math.cos(lad);\n    this.lookAt(new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 1.5, 0));\n  }\n}\n\nclass TimerModel {  \n  constructor() {\n    this._currentTime = 0;\n    this._timeRatio = 1;\n    TimerModel._instance = this;\n  }\n\n  static getInstance() {\n    return TimerModel._instance || new TimerModel();\n  }\n\n  getTimeRatio() {\n    return this._timeRatio;\n  }\n\n  updateTimeRatio() {\n    const lastTime = this._currentTime;\n    const fps60 = 1000 / 60;\n    const timeDiff = new Date().getTime() - lastTime;\n    this._timeRatio = Math.round((timeDiff / fps60 * 10) / 10) >= 2 ? 2 : 1;\n    this._currentTime = new Date().getTime();\n  }\n}\n\nclass ParticleEmitter extends three__WEBPACK_IMPORTED_MODULE_0__.Object3D {\n  constructor() {\n    super();\n    this._pEmitNum = 2; // Particle number to put in one frame\n    this._pMaxNum = 300; // Max particle number to generate\n    this._radius = 5;\n    this._angle = 0;\n    this._colorList = [0x99ffcc, 0xccff99, 0xffffde];\n    const loader = new three__WEBPACK_IMPORTED_MODULE_0__.TextureLoader();\n\n    // texture\n    loader.load(document.querySelector(\"#pImg\").src, (texture) => {\n      this._texture = texture;\n    });\n  }\n\n  update() {\n    if (!this._texture) return;\n\n    // Framerate adjustment when the fps changes\n    const timeScale = TimerModel.getInstance().getTimeRatio();\n\n    // Angle to add in one frame\n    const angleIncrement = 5 * timeScale;\n    this._angle += angleIncrement;\n\n    // Max particle number when the fps changes\n    const tmpMaxNum = this._pMaxNum * (1 / timeScale);\n    const tmpEmitNum = this._pEmitNum * timeScale;\n\n    // Particle actions\n    const items = this.children;\n    let pEmitIndex = 0; // Particle index for multiple particles at one frame\n    items.forEach((particle, index) => {\n      if (particle.isAlive) {\n        // Particle animation\n        particle.update();\n      } else {\n        // Particle initial position\n        particle.init(\n          this._radius,\n          // Particle delay\n          this._angle - ((angleIncrement / tmpEmitNum) * pEmitIndex)\n        );\n        pEmitIndex += 1;\n      }\n    })\n\n    // Additional particles until reaching to the maximum number\n    if (this.children.length < tmpMaxNum) {\n      for (let i = 0; i < tmpEmitNum; i++) {\n        this._addParticle();\n      }\n    }\n  }\n\n  _addParticle() {\n    if (!this._texture) return;\n    const color = this._colorList[Math.floor(Math.random() * 3)]\n    const particle = new Particle(this._texture, color);\n    particle.visible = false;\n    this.add(particle);\n  }\n}\n\nclass Particle extends three__WEBPACK_IMPORTED_MODULE_0__.Sprite {\n  constructor(texture, color = 0xffffff) {\n    super(\n      new three__WEBPACK_IMPORTED_MODULE_0__.SpriteMaterial({\n        color: color,\n        map: texture,\n        transparent: true,\n        blending: three__WEBPACK_IMPORTED_MODULE_0__.AdditiveBlending,\n      })\n    );\n  }\n\n  init(radius, angle) {\n    // Position\n    const rad = (angle * Math.PI) / 180;\n    this.position.set(\n      5 * Math.sin(rad * .3),\n      radius * Math.sin(rad),\n      radius * Math.cos(rad)\n    );\n\n    // Direction to go\n    this._pVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(\n      Math.random() * (-0.06 - 0.06) + 0.06,\n      Math.random() * (0.03 - 0.06) + 0.06,\n      Math.random() * (-0.06 - 0.06) + 0.06\n    );\n\n    // Scale\n    this._pScale = Math.random() * 1.5 + 0.5;\n    this.scale.set(\n      this._pScale,\n      this._pScale,\n      this._pScale\n    );\n\n    this.material.opacity = 1;\n    this.isAlive = true;\n    this.visible = true;\n    this._lifePoint = 80 * (1 / TimerModel.getInstance().getTimeRatio());\n  }\n\n  // Particle moves until it's life ends\n  update() {\n    const timeScale = TimerModel.getInstance().getTimeRatio();\n    this._lifePoint -= 1;\n    this.position.add(this._pVector.clone().multiplyScalar(timeScale));\n    this.material.opacity -= 1 / this._lifePoint;\n    if(0 >= this._lifePoint) this.isAlive = false;\n  }\n}\n\n// cdnない stats.jsをcdnに\n// --- 済み\n// codepen用に画像を外部に置く\n//  https://codepen.io/hisamikurita/pen/JjJpKdZ?editors=0010\n//  https://note.com/siouxcitizen/n/n7e6ab421a17f\n// bufferGeometry + shaderでやる\n\n\n//# sourceURL=webpack:///./src/Main.js?");

/***/ }),

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/Entry.js");
/******/ 	
/******/ })()
;