import {WebGLUtility}     from './webgl.js';
import {WebGLMath}        from './math.js';
import {WebGLGeometry}    from './geometry.js';
import {WebGLOrbitCamera} from './camera.js';
import {hslToRgb, rnd}         from './utils.js';

const m4 = WebGLMath.Mat4;
const v3 = WebGLMath.Vec3;

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  app.load()
    .then(() => {
      app.setups();
      app.debugSetting();
      app.setupLocation();
      app.start();
    }
  );
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

    this.transNumNow = 0;
    this.transNumMax = 3;
    this.transInterval = 2;
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
    // this.gl.enable(this.gl.BLEND);

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

  setups() {
    /**
    ■立方体の体積
    立方体の1辺の長さをaとすると，立方体の体積は
    　a×a×a
    ■球の体積
    半径がrの球の体積は，
    　r×r×r×π×4÷3
    */

    this.pCount = 1000;

    /****************************************
    Geometry (Local Coord.)
    */

    // cubicSphere Geo
    const pSeg = 15;
    const pSize = 1 / 100;
    this.csGeoA = this.cubicSphere(pSeg, pSeg, pSize, [1, 1, 0, 1]);
    this.csGeoB = this.cubicSphere(pSeg, pSeg, pSize, [1, 0, 1, 1]);

    // Ball Geo
    {
      this.ballGeo = WebGLGeometry.sphere(6, 6, 1 / 50, [1, 1, 0, 1]);
      this.ballGeoVBO = [
        WebGLUtility.createVBO(this.gl, this.ballGeo.position),
        WebGLUtility.createVBO(this.gl, this.ballGeo.normal),
        WebGLUtility.createVBO(this.gl, this.ballGeo.color),
      ];
      this.ballGeoIBO = WebGLUtility.createIBO(this.gl, this.ballGeo.index);
    }

    // Cube Geo
    {
      this.cubeGeo = WebGLGeometry.cube(1 / 25, [1, 0, 1, 1]);
      this.cubeGeoVBO = [
        WebGLUtility.createVBO(this.gl, this.cubeGeo.position),
        WebGLUtility.createVBO(this.gl, this.cubeGeo.normal),
        WebGLUtility.createVBO(this.gl, this.cubeGeo.color),
      ];
      this.cubeGeoIBO = WebGLUtility.createIBO(this.gl, this.cubeGeo.index);
    }

    /****************************************
    Position & Color
    */

    // cubicSphere
    this.csColorStep = 3;
    this.csColorsA = [];
    this.csColorsB = [];
    const csTmpScales = [];
    for(let i = 0; i < this.pCount; i++) {
      let tmpRgb = hslToRgb((Math.random() * 90) + 45, 75, 50);
      this.csColorsA[i * this.csColorStep + 0] = tmpRgb.r;
      this.csColorsA[i * this.csColorStep + 1] = tmpRgb.g;
      this.csColorsA[i * this.csColorStep + 2] = tmpRgb.b;

      tmpRgb = hslToRgb((Math.random() * 90) + (45 + 180), 75, 50);
      this.csColorsB[i * this.csColorStep + 0] = tmpRgb.r;
      this.csColorsB[i * this.csColorStep + 1] = tmpRgb.g;
      this.csColorsB[i * this.csColorStep + 2] = tmpRgb.b;

      const tmpScl = rnd(3);
      csTmpScales.push(tmpScl, tmpScl, tmpScl);
    }

    this.csScales = new Float32Array(this.csTmpScales);


    // Sphere
    {
      const BALL_RADIUS = 1.25;
      this.ballPosStep = 3;
      this.ballColStep = 4;
      // 極に集中してしまう問題 https://techblog.kayac.com/how-to-distribute-points-randomly-using-high-school-math
      this.ballTempPos = [];
      this.ballTempCol = [];

      for (let i = 0; i < this.pCount; i += 1) {
        const iRad = rnd() * Math.PI * 2;
        const jRad = rnd() * Math.PI;
        const x = Math.sin(iRad);
        const z = Math.cos(iRad);
        const radius = Math.sin(jRad);
        const y = Math.cos(jRad);
        this.ballTempPos.push(
          x * BALL_RADIUS * radius,
          y * BALL_RADIUS,
          z * BALL_RADIUS * radius
        );

        this.ballTempCol.push(1, 0, 1, 1);
      }

      // Geo座標はfloat32Array（draw pointは多分配列可）
      this.ballPositions = new Float32Array(this.ballTempPos);
      this.ballColors = new Float32Array(this.ballTempCol);

      // this.ballColorStep = 3;
      // this.ballColors = new Float32Array(this.ballNum * this.ballColorStep);
      // for(let i = 0; i < this.ballNum *this.ballColorStep; i += 1) {
      //   const tmpRgb = hslToRgb((rnd() * 135) + 75, 60, 80);
      //   this.ballColors[i * this.ballColorStep + 0] = tmpRgb.r;
      //   this.ballColors[i * this.ballColorStep + 1] = tmpRgb.g;
      //   this.ballColors[i * this.ballColorStep + 2] = tmpRgb.b;
      // }
    }

    // Cube Position & Color
    {
      this.cubePosStep = 3;
      this.cubeColStep = 4;
      this.cubeTempPos = []; // for "Push" Func.
      this.cubeTempCol = [];
      const CUBE_EDGE = 1;

      for (let i = 0; i < this.pCount; i += 1) {
        const axis = Math.floor(rnd() * 3);
        let x, y, z;
        if (axis === 0) {
          x = rnd() * 2 - 1;
          y = rnd() * 2 - 1;
          z = rnd() >= .5 ? -1 : 1;
        } else if (axis === 1) {
          x = rnd() * 2 - 1;
          y = rnd() >= .5 ? -1 : 1;
          z = rnd() * 2 - 1;
        } else if (axis === 2) {
          x = rnd() >= .5 ? -1 : 1;
          y = rnd() * 2 - 1;
          z = rnd() * 2 - 1;
        }

        this.cubeTempPos.push(
          x * CUBE_EDGE,
          y * CUBE_EDGE,
          z * CUBE_EDGE
        );
        const tmpScale = rnd() * 0.5;
        this.cubeTempCol.push(tmpScale, tmpScale, 0, 1);
      }

      this.cubePositions = new Float32Array(this.cubeTempPos);
      this.cubeColors = new Float32Array(this.cubeTempCol);
    }

    // Roll
    {
      this.rollPosStep = 3;
      this.rollColStep = 4;
      this.rollSclStep = 3;
      const WIND_RADIUS = 1.5;
      const X_RISE = .005;
      const TWO_PI = Math.PI * 2;
      this.rollTempPos = [];
      this.rollTempRot = [];
      this.rollTempCol = [];
      this.rollTempScl = [];

      for (let i = 0; i < this.pCount; i += 1) {
        const xRot = rnd() * TWO_PI;;
        const xPos = (i * X_RISE) - ((X_RISE * this.pCount) / 2);
        const tmpRnd = rnd(5);
        this.rollTempPos.push(xPos, WIND_RADIUS, 0);
        this.rollTempRot.push(xRot);
        this.rollTempCol.push(rnd(), rnd(), rnd(), 1);
        this.rollTempScl.push(tmpRnd, tmpRnd, tmpRnd);
      }

      this.rollPositions = new Float32Array(this.rollTempPos);
      this.rollRotations = new Float32Array(this.rollTempRot);
      this.rollColors = new Float32Array(this.rollTempCol);
      this.rollScales = new Float32Array(this.rollTempScl);
    }

    /****************************************
    VBO for all positions
    頂点数が同じにしておけばVBOに全てを入れ込みShaderでMIXできる
    */
    this.csGeoVBO = [
      WebGLUtility.createVBO(this.gl, this.csGeoA.position),
      WebGLUtility.createVBO(this.gl, this.csGeoA.normal),
      // WebGLUtility.createVBO(this.gl, this.csGeoA.color),
      WebGLUtility.createVBO(this.gl, this.csGeoB.position),
      WebGLUtility.createVBO(this.gl, this.csGeoB.normal),
      // WebGLUtility.createVBO(this.gl, this.csGeoB.color),
    ];
    this.csGeoIBO = WebGLUtility.createIBO(this.gl, this.csGeoA.index);
  }

  setupLocation() {
    const gl = this.gl;
    this.standardAttrLocation = [
      gl.getAttribLocation(this.standardProgram, 'positionA'),
      gl.getAttribLocation(this.standardProgram, 'normalA'),
      // gl.getAttribLocation(this.standardProgram, 'colorA'),
      gl.getAttribLocation(this.standardProgram, 'positionB'),
      gl.getAttribLocation(this.standardProgram, 'normalB'),
      // gl.getAttribLocation(this.standardProgram, 'colorB'),
    ];
    this.standardAttrStride = [
      3, 3,
      3, 3,
    ];
    this.standardUniLocation = {
      // mvpMatrix: gl.getUniformLocation(this.standardProgram, 'mvpMatrix'),
      modelMatrix: gl.getUniformLocation(this.standardProgram, 'modelMatrix'),
      viewMatrix: gl.getUniformLocation(this.standardProgram, 'viewMatrix'),
      projectionMatrix: gl.getUniformLocation(this.standardProgram, 'projectionMatrix'),
      normalMatrix: gl.getUniformLocation(this.standardProgram, 'normalMatrix'), // 法線変換
      // ambientLight: gl.getUniformLocation(this.standardProgram, 'ambientLight'), // 環境光
      // cubeColorA: gl.getUniformLocation(this.standardProgram, 'cubeColorA'), // ライトベクトル
      csColorA: gl.getUniformLocation(this.standardProgram, 'csColorA'), // パーティクル色A
      csColorB: gl.getUniformLocation(this.standardProgram, 'csColorB'), // パーティクル色B
      time: gl.getUniformLocation(this.standardProgram, 'time'),
      ratio: gl.getUniformLocation(this.standardProgram, 'ratio'), // MIX割合
    };
  }

  // FrameBuffer & ProgramObject
  setupStandardRendering() {
    const gl = this.gl;
    // フレームバッファをバインドして描画の対象とする（Defaultは不要）
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferArray[0].framebuffer);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.standardProgram);
  }

  debugSetting() {
    this.localPositionRatio = 1;

    const pane = new Tweakpane.Pane();
    // const parameter = {normal: false};
    pane.addBlade({
      view: 'slider',
      label: 'ratio',
      min: 0.0,
      max: 1.0,
      value: this.localPositionRatio,
    }).on('change', v => this.localPositionRatio = v.value);
  }

  start() {
    const gl = this.gl;
    this.startTime = Date.now();
    this.isRender = true; // shader、geo、uniform準備後renderループ開始
    this.render();
  }

  render() {
    // Initial Settings
    const gl = this.gl;
    if (this.isRender === true) requestAnimationFrame(this.render);
    this.currentTime = (Date.now() - this.startTime) / 1000; // Time
    const timeScale = 0.2;

    this.autoPlay(this.currentTime); // Transition番号++

    // Cam
    const v = this.camera.update();
    const fovy   = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near   = 0.1
    const far    = 20.0;
    const p = m4.perspective(fovy, aspect, near, far);
    // const vp = m4.multiply(p, v);

    // Production
    {
      this.setupStandardRendering();

      // Attributes
      WebGLUtility.enableBuffer(gl, this.csGeoVBO, this.standardAttrLocation, this.standardAttrStride, this.csGeoIBO);

      let m;
      for(let i = 0; i < this.pCount; i++) {
        m = m4.identity();
        m = m4.rotate(m, this.currentTime * timeScale, v3.create(1, 0, 0));
        m = m4.rotate(m, this.rollRotations[i], v3.create(1, 0, 0));

        // roll
        m = m4.translate(m, v3.create(
          this.rollPositions[i * this.rollPosStep + 0],
          this.rollPositions[i * this.rollPosStep + 1],
          this.rollPositions[i * this.rollPosStep + 2],
        ));
        // // Cubic
        // m = m4.translate(m, v3.create(
        //   this.cubePositions[i * this.cubePosStep + 0],
        //   this.cubePositions[i * this.cubePosStep + 1],
        //   this.cubePositions[i * this.cubePosStep + 2],
        // ));
        // // Spherical
        // m = m4.translate(m, v3.create(
        //   this.ballPositions[i * this.ballPosStep + 0],
        //   this.ballPositions[i * this.ballPosStep + 1],
        //   this.ballPositions[i * this.ballPosStep + 2],
        // ));

        m = m4.scale(m, v3.create(
          this.rollScales[i * this.rollSclStep + 0],
          this.rollScales[i * this.rollSclStep + 1],
          this.rollScales[i * this.rollSclStep + 2],
        ));
        // const mvp = m4.multiply(vp, m);
        const normalMatrix = m4.transpose(m4.inverse(m));

        // gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        gl.uniformMatrix4fv(this.standardUniLocation.modelMatrix, false, m);
        gl.uniformMatrix4fv(this.standardUniLocation.viewMatrix, false, v);
        gl.uniformMatrix4fv(this.standardUniLocation.projectionMatrix, false, p);
        gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        gl.uniform4fv(this.standardUniLocation.csColorA, [
          this.csColorsA[i * this.csColorStep + 0],
          this.csColorsA[i * this.csColorStep + 1],
          this.csColorsA[i * this.csColorStep + 2],
          1.0
        ]);
        gl.uniform4fv(this.standardUniLocation.csColorB, [
          this.csColorsB[i * this.csColorStep + 0],
          this.csColorsB[i * this.csColorStep + 1],
          this.csColorsB[i * this.csColorStep + 2],
          1.0
        ]);
        gl.uniform1f(this.standardUniLocation.time, this.currentTime); // 1f型に第2引数booleanは不要
        gl.uniform1f(this.standardUniLocation.ratio, this.localPositionRatio);

        gl.drawElements(gl.TRIANGLES, this.csGeoA.index.length, gl.UNSIGNED_SHORT, 0);
        // gl.drawArrays(gl.LINE_LOOP, 0, this.csGeoA.position.length / 3);
        // gl.drawArrays(gl.POINTS, 0, this.csGeoA.position.length / 3);
      }
    }

    // ロール描画
    // {
    //   this.setupStandardRendering();

    //   WebGLUtility.enableBuffer(gl, this.cubeGeoVBO, this.standardAttrLocation, this.standardAttrStride, this.cubeGeoIBO);

    //   let m;
    //   for(let i = 0; i < this.pCount; i++) {
    //     m = m4.identity();
    //     m = m4.rotate(m, this.currentTime, v3.create(1, 0, 0));
    //     m = m4.rotate(m, this.rollRotations[i], v3.create(1, 0, 0));
    //     m = m4.translate(m, v3.create(
    //       this.rollPositions[i * this.rollPosStep + 0],
    //       this.rollPositions[i * this.rollPosStep + 1],
    //       this.rollPositions[i * this.rollPosStep + 2],
    //     ));
    //     m = m4.scale(m, v3.create(
    //       this.rollScales[i * this.rollSclStep + 0],
    //       this.rollScales[i * this.rollSclStep + 1],
    //       this.rollScales[i * this.rollSclStep + 2],
    //     ));
    //     const mvp = m4.multiply(vp, m);
    //     const normalMatrix = m4.transpose(m4.inverse(m));

    //     gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
    //     gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
    //     gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
    //     gl.drawElements(gl.TRIANGLES, this.cubeGeo.index.length, gl.UNSIGNED_SHORT, 0);
    //     // gl.drawArrays(gl.LINE_STRIP, 0, this.cubeGeo.position.length / 3);
    //   }
    // }

    // 立方体描画
    // {
    //   this.setupStandardRendering();

    //   WebGLUtility.enableBuffer(gl, this.ballGeoVBO, this.standardAttrLocation, this.standardAttrStride, this.ballGeoIBO);

    //   let m;
    //   for(let i = 0; i < this.pCount; i++) {
    //     m = m4.identity();
    //     // m = m4.rotate(m, this.currentTime, v3.create(1.0, 1.0, 1.0));
    //     m = m4.translate(m, v3.create(
    //       this.cubePositions[i * this.cubePosStep + 0],
    //       this.cubePositions[i * this.cubePosStep + 1],
    //       this.cubePositions[i * this.cubePosStep + 2],
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
    //     gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
    //     gl.drawElements(gl.TRIANGLES, this.ballGeo.index.length, gl.UNSIGNED_SHORT, 0);
    //   }
    // }

    // 球体描画
    // {
    //   this.setupStandardRendering();

    //   WebGLUtility.enableBuffer(gl, this.ballGeoVBO, this.standardAttrLocation, this.standardAttrStride, this.ballGeoIBO);

    //   let m;
    //   for(let i = 0; i < this.pCount; i++) {
    //     m = m4.identity();
    //     // m = m4.rotate(m, this.currentTime, v3.create(1.0, 1.0, 1.0));
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
    // gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
    //     gl.drawElements(gl.TRIANGLES, this.ballGeo.index.length, gl.UNSIGNED_SHORT, 0);
    //   }
    // }
  }

  // n秒毎にトランジション番号++
  autoPlay(t) {
    if(Math.floor(t) % this.transInterval === 0){
      if(this.countFlg === true) {
        if (this.transNumNow > this.transNumMax) this.transNumNow = 0;
        else this.transNumNow++;
        this.countFlg = false;
      }
    } else {
      this.countFlg = true;
    }
  }

  /****************************************
  Utilities
  */

  /**
   * 球体の頂点を持った立方体情報を生成する
   * @param {number} row - 球の縦方向（緯度方向）の分割数
   * @param {number} column - 球の横方向（経度方向）の分割数
   * @param {number} rad - 球の半径
   * @param {Array.<number>} color - RGBA を 0.0 から 1.0 の範囲で指定した配列
   * @return {object}
   * @property {Array.<number>} position - 頂点座標
   * @property {Array.<number>} normal - 頂点法線
   * @property {Array.<number>} color - 頂点カラー
   * @property {Array.<number>} texCoord - テクスチャ座標
   * @property {Array.<number>} index - 頂点インデックス（gl.TRIANGLES）
   * @example
   * const sphereData = WebGLGeometry.sphere(64, 64, 1.0, [1.0, 1.0, 1.0, 1.0]);
   */
  cubicSphere (row, column, rad, color) {
    const pos = [];
    const nor = [];
    const col = [];
    const st  = [];
    const idx = [];
    for (let i = 0; i <= row; i++) { // 横軸
      const r = Math.PI / row * i; // 円周
      const ry = Math.cos(r);
      const rr = Math.sin(r);
      for (let j = 0; j <= column; j++) {
        const tr = Math.PI * 2 / column * j;
        let tx = rr * rad * Math.cos(tr);
        // ここで四角にする
        if(tx >= .5) tx = .5;
        const ty = ry * rad;
        const tz = rr * rad * Math.sin(tr);
        const rx = rr * Math.cos(tr);
        const rz = rr * Math.sin(tr);
        pos.push(tx, ty, tz);
        nor.push(rx, ry, rz);
        col.push(color[0], color[1], color[2], color[3]);
        st.push(1 - 1 / column * j, 1 / row * i);
      }
    }
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        const r = (column + 1) * i + j;
        idx.push(r,          r + 1, r + column + 2);
        idx.push(r, r + column + 2, r + column + 1);
      }
    }
    return {position: pos, normal: nor, color: col, texCoord: st, index: idx}
  }

}