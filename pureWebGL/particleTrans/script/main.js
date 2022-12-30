import {WebGLUtility}     from './webgl.js';
import {WebGLMath}        from './math.js';
import {WebGLGeometry}    from './geometry.js';
import {WebGLOrbitCamera} from './camera.js';
import {hslToRgb}         from './utils.js';
import '../../lib/tweakpane-3.1.0.min.js';

const m4 = WebGLMath.Mat4;
const v3 = WebGLMath.Vec3;

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  app.load()
  .then(() => {
    app.setupGeometry();
    app.setupLocation();
    app.start();
  });

  // const pane = new Tweakpane.Pane();
  // const parameter = {normal: false};
  // pane
  //   .addInput(parameter, 'normal')
  //   .on('change', (v) => {
  //     app.setNormalVisibility(v.value);
    // });

}, false);

class App {

  constructor() {
    this.canvas = null;
    this.gl = null;
    this.startTime = 0;
    this.currentTime = 0;
    this.render = this.render.bind(this);
    this.ambientLight = 0.0;
    this.lightVector = new Float32Array([0.0, 0.0, 1.0]);
  }

  init() {
    // Canvas
    this.canvas = document.getElementById('webgl-canvas');
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    // Cam Instancing
    this.camera = new WebGLOrbitCamera(
      this.canvas, {
      distance: 5.0,
      min: 1.0,
      max: 10.0,
      move: 2.0,
    });

    // Back face & Depth test
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.resize();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  load() {
    return new Promise(resolve => {
      const gl = this.gl;
      let vs = null;
      let fs = null;

      WebGLUtility.loadFile('./shader/luminance.vert')
      .then(vertexShaderSource => {
        vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
        return WebGLUtility.loadFile('./shader/luminance.frag');
      })
      .then(fragmentShaderSource => {
        fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        this.luminanceProgram = WebGLUtility.createProgramObject(gl, vs, fs);
        return WebGLUtility.loadFile('./shader/blur.vert');
      })
      .then(vertexShaderSource => {
        vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
        return WebGLUtility.loadFile('./shader/blur.frag');
      })
      .then(fragmentShaderSource => {
        fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        this.blurProgram = WebGLUtility.createProgramObject(gl, vs, fs);
        return WebGLUtility.loadFile('./shader/add.vert');
      })
      .then(vertexShaderSource => {
        vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
        return WebGLUtility.loadFile('./shader/add.frag');
      })
      .then(fragmentShaderSource => {
        fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        this.addProgram = WebGLUtility.createProgramObject(gl, vs, fs);
        return WebGLUtility.loadFile('./shader/standard.vert');
      })
      .then(vertexShaderSource => {
        vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
        return WebGLUtility.loadFile('./shader/standard.frag');
      })
      .then(fragmentShaderSource => {
        fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        this.standardProgram = WebGLUtility.createProgramObject(gl, vs, fs);
        resolve();
      })
    });
  }

  setupGeometry() {
    this.ballGeo = WebGLGeometry.sphere(
      8, 8,
      1 / 100,
      [1, 1, 0, 1]
    );
    this.ballVBO = [
      WebGLUtility.createVBO(this.gl, this.ballGeo.position),
      WebGLUtility.createVBO(this.gl, this.ballGeo.normal),
      WebGLUtility.createVBO(this.gl, this.ballGeo.color),
    ];
    this.ballIBO = WebGLUtility.createIBO(this.gl, this.ballGeo.index);

    // Position & Color
    this.ballPosStep = 3;
    this.ballColStep = 4;
    // Ball Position
    this.ballNumCircle = 25; // 1周のパーティクル数
    this.ballNumSphere = this.ballNumCircle * this.ballNumCircle;
    const BALL_RADIUS = 1;
    // geometry座標はfloat32Array（多分draw pointは普通の配列可）
    this.ballTempPos = [];
    this.ballTempCol = [];
    // this.ballColors = new Float32Array(this.ballNumCircle * this.ballColStep);
    for (let i = 0; i < this.ballNumCircle; i += 1) {
      const iRad = (i / this.ballNumCircle) * Math.PI * 2;
      const x = Math.sin(iRad);
      const z = Math.cos(iRad);
      for (let j = 0; j < this.ballNumCircle;  j += 1) {
        const jRad = j / this.ballNumCircle * Math.PI;
        const radius = Math.sin(jRad);
        const y = Math.cos(jRad);
        // position
        this.ballTempPos.push(
          x * BALL_RADIUS * radius,
          y * BALL_RADIUS,
          z * BALL_RADIUS * radius
        );
        this.ballTempCol.push(0.5, i / this.ballNumCircle, j / this.ballNumCircle, 1.0);
      }
    }
    this.ballPositions = new Float32Array(this.ballTempPos);
    this.ballColors = new Float32Array(this.ballTempCol);

    // this.ballColorStep = 3;
    // this.ballColors = new Float32Array(this.ballNum * this.ballColorStep);
    // for(let i = 0; i < this.ballNum *this.ballColorStep; i += 1) {
    //   const tmpRgb = hslToRgb((Math.random() * 135) + 75, 60, 80);
    //   this.ballColors[i * this.ballColorStep + 0] = tmpRgb.r;
    //   this.ballColors[i * this.ballColorStep + 1] = tmpRgb.g;
    //   this.ballColors[i * this.ballColorStep + 2] = tmpRgb.b;
    // }
  }

  setupLocation() {
    const gl = this.gl;
    this.standardAttrLocation = [
      gl.getAttribLocation(this.standardProgram, 'position'),
      gl.getAttribLocation(this.standardProgram, 'normal'),
      gl.getAttribLocation(this.standardProgram, 'color'),
    ];
    this.standardAttrStride = [3, 3, 4];
    this.standardUniLocation = {
      mvpMatrix: gl.getUniformLocation(this.standardProgram, 'mvpMatrix'), // MVP 行列
      normalMatrix: gl.getUniformLocation(this.standardProgram, 'normalMatrix'), // 法線変換行列
      ambientLight: gl.getUniformLocation(this.standardProgram, 'ambientLight'), // 環境光
      lightVector: gl.getUniformLocation(this.standardProgram, 'lightVector'), // ライトベクトル
      // ballColor: gl.getUniformLocation(this.standardProgram, 'ballColor'), // 色
    };
  }

  setupStandardRendering() {
    const gl = this.gl;
    // フレームバッファをバインドして描画の対象とする（Defaultは不要）
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferArray[0].framebuffer);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.standardProgram);
  }

  start() {
    const gl = this.gl;
    this.startTime = Date.now();
    this.isRender = true; // shader, geo, uniformできたら
    this.render();
  }

  render() {
    const gl = this.gl;
    if (this.isRender === true) requestAnimationFrame(this.render);
    this.currentTime = (Date.now() - this.startTime);

    // 通常描画
    {
      this.setupStandardRendering();
      const v = this.camera.update();
      const fovy   = 45;
      const aspect = window.innerWidth / window.innerHeight;
      const near   = 0.1
      const far    = 20.0;
      const p = m4.perspective(fovy, aspect, near, far);
      const vp = m4.multiply(p, v);

      WebGLUtility.enableBuffer(gl, this.ballVBO, this.standardAttrLocation, this.standardAttrStride, this.ballIBO);

      const timeScale = 0.001;
      let m;
      // return;
      for(let i = 0; i < this.ballNumSphere; i++) {
        m = m4.identity();
        // m = m4.rotate(m, this.currentTime * timeScale, v3.create(1.0, 1.0, 1.0));
        // m = m4.rotate(m, this.currentTime * this.ballRotTimeScales[i], v3.create(
        //   this.ballAxises[i * this.ballAxisStep + 0],
        //   this.ballAxises[i * this.ballAxisStep + 1],
        //   1.0 // 変数にすると不安定
        // ));
        // 個々の配置
        m = m4.translate(m, v3.create(
          this.ballPositions[i * this.ballPosStep + 0],
          this.ballPositions[i * this.ballPosStep + 1],
          this.ballPositions[i * this.ballPosStep + 2],
        ));
        // m = m4.rotate(m, this.currentTime * this.cubeRotTimeScales[i], v3.create(
        //   this.cubeAxises[i * this.cubeAxisStep + 0],
        //   this.cubeAxises[i * this.cubeAxisStep + 1],
        //   1.0
        // ));

        const mvp = m4.multiply(vp, m);
        const normalMatrix = m4.transpose(m4.inverse(m));

        gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        gl.uniform3fv(
          this.standardUniLocation.lightVector,
          this.lightVector
        );
        gl.uniform4fv(this.standardUniLocation.ambientLight, [
          this.ambientLight,
          this.ambientLight,
          this.ambientLight,
          this.ambientLight
        ]);
        // gl.uniform4fv(this.standardUniLocation.ballColor, [
        //   this.ballColors[i * this.ballColorStep + 0],
        //   this.ballColors[i * this.ballColorStep + 1],
        //   this.ballColors[i * this.ballColorStep + 2],
        //   1.0
        // ]);
        gl.drawElements(gl.TRIANGLES, this.ballGeo.index.length, gl.UNSIGNED_SHORT, 0);
      }
    }
  }
}
