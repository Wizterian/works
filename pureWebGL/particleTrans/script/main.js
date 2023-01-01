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

    this.resize = this.resize.bind(this);

    // this.ambientLight = 0.0;
    // this.lightVector = new Float32Array([0.0, 0.0, 1.0]);
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
    window.addEventListener('resize', this.resize, false);
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
    /**
    ■立方体の体積
    立方体の1辺の長さをaとすると，立方体の体積は
    　a×a×a
    ■球の体積
    半径がrの球の体積は，
    　r×r×r×π×4÷3
    */

    // Ball Geometry
    this.ballGeo = WebGLGeometry.sphere(
      6, 6,
      1 / 80,
      [1, 1, 0, 1]
    );
    this.ballVBO = [
      WebGLUtility.createVBO(this.gl, this.ballGeo.position),
      WebGLUtility.createVBO(this.gl, this.ballGeo.normal),
      WebGLUtility.createVBO(this.gl, this.ballGeo.color),
    ];
    this.ballIBO = WebGLUtility.createIBO(this.gl, this.ballGeo.index);

    // Ball Position & Color
    this.ballPosStep = 3;
    this.ballColStep = 4;
    // 極に集中してしまう
    // https://techblog.kayac.com/how-to-distribute-points-randomly-using-high-school-math
    this.ballCount = 3000;
    const BALL_RADIUS = 1.25;
    this.ballTempPos = [];
    this.ballTempCol = [];
    for (let i = 0; i < this.ballCount; i += 1) {
      const iRad = Math.random() * Math.PI * 2;
      const jRad = Math.random() * Math.PI;
      const x = Math.sin(iRad);
      const z = Math.cos(iRad);
      const radius = Math.sin(jRad);
      const y = Math.cos(jRad);

      this.ballTempPos.push(
        x * BALL_RADIUS * radius,
        y * BALL_RADIUS,
        z * BALL_RADIUS * radius
      );
    }
    // Geo座標はfloat32Array（draw pointは多分配列可）
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

    // Cube Geometry
    this.cubeGeo = WebGLGeometry.cube(1 / 40, [1, 0, 1, 1]);
    this.cubeVBO = [
      WebGLUtility.createVBO(this.gl, this.cubeGeo.position),
      WebGLUtility.createVBO(this.gl, this.cubeGeo.normal),
      WebGLUtility.createVBO(this.gl, this.cubeGeo.color),
    ];
    this.cubeIBO = WebGLUtility.createIBO(this.gl, this.cubeGeo.index);

    // Cube Position & Color
    this.cubePosStep = 3;
    this.cubeColStep = 4;

    this.cubeCount = this.ballCount;
    const CUBE_EDGE = 1;
    this.cubeTempPos = [];
    this.cubeTempCol = [];
    for (let i = 0; i < this.cubeCount; i += 1) {
      const axis = Math.floor(Math.random() * 3);
      let x, y, z;
      if(axis === 0) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() >= .5 ? -1 : 1;
      } else if(axis === 1) {
        x = Math.random() * 2 - 1;
        y = Math.random() >= .5 ? -1 : 1;
        z = Math.random() * 2 - 1;
      } else if(axis === 2) {
        x = Math.random() >= .5 ? -1 : 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
      }
      this.cubeTempPos.push(
        x * CUBE_EDGE,
        y * CUBE_EDGE,
        z * CUBE_EDGE
      );
    }
    this.cubePositions = new Float32Array(this.cubeTempPos);
    this.cubeColors = new Float32Array(this.cubeTempCol);
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
      // mvpMatrix: gl.getUniformLocation(this.standardProgram, 'mvpMatrix'), // MVP 行列
      normalMatrix: gl.getUniformLocation(this.standardProgram, 'normalMatrix'), // 法線変換行列
      // ambientLight: gl.getUniformLocation(this.standardProgram, 'ambientLight'), // 環境光
      // lightVector: gl.getUniformLocation(this.standardProgram, 'lightVector'), // ライトベクトル
      // ballColor: gl.getUniformLocation(this.standardProgram, 'ballColor'), // 色
      time: gl.getUniformLocation(this.standardProgram, 'time'), // 時間
      model: gl.getUniformLocation(this.standardProgram, 'model'), // M行列
      viewProjection: gl.getUniformLocation(this.standardProgram, 'viewProjection'), // VP行列
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
    this.isRender = true; // shader, geo, uniformできたらrenderループ開始
    this.render();
  }

  render() {
    const gl = this.gl;
    if (this.isRender === true) requestAnimationFrame(this.render);
    this.currentTime = (Date.now() - this.startTime) / 1000;

    // 立方体描画
    {
      this.setupStandardRendering();
      const v = this.camera.update();
      const fovy   = 45;
      const aspect = window.innerWidth / window.innerHeight;
      const near   = 0.1
      const far    = 20.0;
      const p = m4.perspective(fovy, aspect, near, far);
      const vp = m4.multiply(p, v);

      WebGLUtility.enableBuffer(gl, this.cubeVBO, this.standardAttrLocation, this.standardAttrStride, this.cubeIBO);

      let m;
      for(let i = 0; i < this.cubeCount; i++) {
        m = m4.identity();
        m = m4.rotate(m, this.currentTime, v3.create(1.0, 1.0, 1.0));
        m = m4.translate(m, v3.create(
          this.cubePositions[i * this.cubePosStep + 0],
          this.cubePositions[i * this.cubePosStep + 1],
          this.cubePositions[i * this.cubePosStep + 2],
        ));

        // const mvp = m4.multiply(vp, m);
        const normalMatrix = m4.transpose(m4.inverse(m));

        // gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        // gl.uniform3fv(
        //   this.standardUniLocation.lightVector,
        //   this.lightVector
        // );
        // gl.uniform4fv(this.standardUniLocation.ambientLight, [
        //   this.ambientLight,
        //   this.ambientLight,
        //   this.ambientLight,
        //   this.ambientLight
        // ]);
        // gl.uniform4fv(this.standardUniLocation.ballColor, [
        //   this.ballColors[i * this.ballColorStep + 0],
        //   this.ballColors[i * this.ballColorStep + 1],
        //   this.ballColors[i * this.ballColorStep + 2],
        //   1.0
        // ]);
        gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
        gl.uniformMatrix4fv(this.standardUniLocation.model, false, m);
        gl.uniformMatrix4fv(this.standardUniLocation.viewProjection, false, vp);
        gl.drawElements(gl.TRIANGLES, this.cubeGeo.index.length, gl.UNSIGNED_SHORT, 0);
      }
    }

    // // 球体描画
    // {
    //   this.setupStandardRendering();
    //   const v = this.camera.update();
    //   const fovy   = 45;
    //   const aspect = window.innerWidth / window.innerHeight;
    //   const near   = 0.1
    //   const far    = 20.0;
    //   const p = m4.perspective(fovy, aspect, near, far);
    //   const vp = m4.multiply(p, v);

    //   WebGLUtility.enableBuffer(gl, this.ballVBO, this.standardAttrLocation, this.standardAttrStride, this.ballIBO);

    //   const timeScale = 0.001;
    //   let m;
    //   // return;
    //   for(let i = 0; i < this.ballCount; i++) {
    //     m = m4.identity();
    //     // m = m4.rotate(m, this.currentTime * timeScale, v3.create(1.0, 1.0, 1.0));
    //     m = m4.translate(m, v3.create(
    //       this.ballPositions[i * this.ballPosStep + 0],
    //       this.ballPositions[i * this.ballPosStep + 1],
    //       this.ballPositions[i * this.ballPosStep + 2],
    //     ));

    //     const mvp = m4.multiply(vp, m);
    //     const normalMatrix = m4.transpose(m4.inverse(m));

    //     gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
    //     gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
    //     // gl.uniform3fv(
    //     //   this.standardUniLocation.lightVector,
    //     //   this.lightVector
    //     // );
    //     // gl.uniform4fv(this.standardUniLocation.ambientLight, [
    //     //   this.ambientLight,
    //     //   this.ambientLight,
    //     //   this.ambientLight,
    //     //   this.ambientLight
    //     // ]);
    //     // gl.uniform4fv(this.standardUniLocation.ballColor, [
    //     //   this.ballColors[i * this.ballColorStep + 0],
    //     //   this.ballColors[i * this.ballColorStep + 1],
    //     //   this.ballColors[i * this.ballColorStep + 2],
    //     //   1.0
    //     // ]);
    //     gl.drawElements(gl.TRIANGLES, this.ballGeo.index.length, gl.UNSIGNED_SHORT, 0);
    //   }
    // }
  }
}
