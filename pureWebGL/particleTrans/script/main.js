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
      app.testFn();
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

    this.transCountNow = 1;
    this.transCountMax = 3;
    this.transCountInterval = 2;

    this.transStrength_1 = {value: 1};
    this.transStrength_2 = {value: 0};
    this.transStrength_3 = {value: 0};
    this.transStrength_test = {value: 0};
    this.transDur = 1.5;
    this.transConfig = [
      {duration: this.transDur, ease: 'power4.inOut', value : 0},
      {duration: this.transDur, ease: 'power4.inOut', value : 1},
    ]
  }

  // .to(this.transStrength_test, {
  //   duration: .5 / 2,
  //   ease: 'power4.inOut',
  //   value : 1.
  // })
  // .to(this.transStrength_test, {
  //   duration: .5 / 2,
  //   ease: 'power4.inOut',
  //   value : 0.
  // })

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

    this.pCount = 5000;

    /****************************************
    Geometry (Local Coord.)
    */

    // cubicSphere Geo
    const pSeg = 10;
    const pSize = 1 / 120;
    this.csGeoA = this.cubicSphere(pSeg, pSeg, pSize, [1, 1, 0, 1]);
    this.csGeoB = this.cubicSphere(pSeg, pSeg, pSize, [1, 0, 1, 1]);
    this.csGeoC = this.cubicSphere(pSeg, pSeg, pSize, [0, 1, 1, 1]);

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
    this.csColors_1 = [];
    this.csColors_2 = [];
    this.csColors_3 = [];
    const csTmpScales = [];
    for(let i = 0; i < this.pCount; i++) {
      let tmpRgb = hslToRgb((Math.random() * 90) + 315, 80, 50);
      this.csColors_1[i * this.csColorStep + 0] = tmpRgb.r;
      this.csColors_1[i * this.csColorStep + 1] = tmpRgb.g;
      this.csColors_1[i * this.csColorStep + 2] = tmpRgb.b;

      tmpRgb = hslToRgb((Math.random() * 90) + (315 + 120), 80, 50);
      this.csColors_2[i * this.csColorStep + 0] = tmpRgb.r;
      this.csColors_2[i * this.csColorStep + 1] = tmpRgb.g;
      this.csColors_2[i * this.csColorStep + 2] = tmpRgb.b;

      tmpRgb = hslToRgb((Math.random() * 90) + (315 + 240), 80, 50);
      this.csColors_3[i * this.csColorStep + 0] = tmpRgb.r;
      this.csColors_3[i * this.csColorStep + 1] = tmpRgb.g;
      this.csColors_3[i * this.csColorStep + 2] = tmpRgb.b;

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
      const Z_RISE = .0075;
      const TWO_PI = Math.PI * 2;
      this.rollTempPos = [];
      this.rollTempRot = [];
      this.rollTempCol = [];
      this.rollTempScl = [];

      for (let i = 0; i < this.pCount; i += 1) {
        const zRot = rnd() * TWO_PI;;
        const zPos = (i * Z_RISE) - ((Z_RISE * this.pCount) / 2);
        const tmpRnd = rnd(12);
        this.rollTempPos.push(0, WIND_RADIUS, zPos);
        this.rollTempRot.push(zRot);
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
      WebGLUtility.createVBO(this.gl, this.csGeoC.position),
      WebGLUtility.createVBO(this.gl, this.csGeoC.normal),
      // WebGLUtility.createVBO(this.gl, this.csGeoC.color),
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
      gl.getAttribLocation(this.standardProgram, 'positionC'),
      gl.getAttribLocation(this.standardProgram, 'normalC'),
      // gl.getAttribLocation(this.standardProgram, 'colorB'),
    ];
    this.standardAttrStride = [
      3, 3,
      3, 3,
      3, 3,
    ];
    this.standardUniLocation = {
      // mvpMatrix: gl.getUniformLocation(this.standardProgram, 'mvpMatrix'),
      modelMatrix_1: gl.getUniformLocation(
        this.standardProgram, 'modelMatrix_1'
      ),
      modelMatrix_2: gl.getUniformLocation(
        this.standardProgram, 'modelMatrix_2'
      ),
      modelMatrix_3: gl.getUniformLocation(
        this.standardProgram, 'modelMatrix_3'
      ),
      viewMatrix: gl.getUniformLocation(
        this.standardProgram, 'viewMatrix'
      ),
      projectionMatrix: gl.getUniformLocation(
        this.standardProgram, 'projectionMatrix'
      ),
      normalMatrix: gl.getUniformLocation(
        this.standardProgram, 'normalMatrix'
      ), // 法線変換
      // ambientLight: gl.getUniformLocation(
      //   this.standardProgram, 'ambientLight'
      // ), // 環境光
      // cubeColorA: gl.getUniformLocation(
      //   this.standardProgram, 'cubeColorA'
      // ), // ライトベクトル
      csColor_1: gl.getUniformLocation(
        this.standardProgram, 'csColor_1'
      ), // パーティクル色A
      csColor_2: gl.getUniformLocation(
        this.standardProgram, 'csColor_2'
      ), // パーティクル色B
      csColor_3: gl.getUniformLocation(
        this.standardProgram, 'csColor_3'
      ), // パーティクル色C
      time: gl.getUniformLocation(this.standardProgram, 'time'),
      ratio: gl.getUniformLocation(this.standardProgram, 'ratio'), // MIX比 後で消す
      transStrength_1: gl.getUniformLocation(
        this.standardProgram, 'transStrength_1'
      ),
      transStrength_2: gl.getUniformLocation(
        this.standardProgram, 'transStrength_2'
      ),
      transStrength_3: gl.getUniformLocation(
        this.standardProgram, 'transStrength_3'
      ),
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
    this.autoPlay();
  }

  testFn() {
    return;
    const tl = gsap.timeline();
    tl
      .to(this.transStrength_test, {
        duration: .5 / 2,
        ease: 'power4.inOut',
        value : 1.
      })
      .to(this.transStrength_test, {
        duration: .5 / 2,
        ease: 'power4.inOut',
        value : 0.
      })
  }

  render() {
    // console.log(this.transStrength_test.value);

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

      let m_1, m_2, m_3;
      for(let i = 0; i < this.pCount; i++) {

        // Spherical Formation
        m_1 = m4.identity();
        m_1 = m4.rotate(m_1, this.currentTime * timeScale, v3.create(1, 1, 0));
        m_1 = m4.translate(m_1, v3.create(
          this.ballPositions[i * this.ballPosStep + 0],
          this.ballPositions[i * this.ballPosStep + 1],
          this.ballPositions[i * this.ballPosStep + 2],
        ));

        // Rolling Formation
        m_2 = m4.identity();
        m_2 = m4.rotate(m_2, this.currentTime, v3.create(0, 0, 1));
        m_2 = m4.rotate(m_2, this.rollRotations[i], v3.create(0, 0, 1));
        m_2 = m4.translate(m_2, v3.create(
          this.rollPositions[i * this.rollPosStep + 0],
          this.rollPositions[i * this.rollPosStep + 1],
          this.rollPositions[i * this.rollPosStep + 2],
        ));
        m_2 = m4.scale(m_2, v3.create(
          this.rollScales[i * this.rollSclStep + 0],
          this.rollScales[i * this.rollSclStep + 1],
          this.rollScales[i * this.rollSclStep + 2],
        ));

        // Cubic Formation
        m_3 = m4.identity();
        m_3 = m4.rotate(m_3, this.currentTime * timeScale, v3.create(1, 0, 1));
        m_3 = m4.translate(m_3, v3.create(
          this.cubePositions[i * this.cubePosStep + 0],
          this.cubePositions[i * this.cubePosStep + 1],
          this.cubePositions[i * this.cubePosStep + 2],
        ));

        // MVP Matrix
        // const mvp = m4.multiply(vp, m_1);

        // Normal 複数ある場合切り替え？
        const normalMatrix = m4.transpose(m4.inverse(m_1));

        /****************************************
        Uniform Transfer
        */

        // Model
        // gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        gl.uniformMatrix4fv(this.standardUniLocation.modelMatrix_1, false, m_1);
        gl.uniformMatrix4fv(this.standardUniLocation.modelMatrix_2, false, m_2);
        gl.uniformMatrix4fv(this.standardUniLocation.modelMatrix_3, false, m_3);
        // View & Proj.
        gl.uniformMatrix4fv(this.standardUniLocation.viewMatrix, false, v);
        gl.uniformMatrix4fv(this.standardUniLocation.projectionMatrix, false, p);
        // Normal
        gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        // Color
        gl.uniform4fv(this.standardUniLocation.csColor_1, [
          this.csColors_1[i * this.csColorStep + 0],
          this.csColors_1[i * this.csColorStep + 1],
          this.csColors_1[i * this.csColorStep + 2],
          1.0
        ]);
        gl.uniform4fv(this.standardUniLocation.csColor_2, [
          this.csColors_2[i * this.csColorStep + 0],
          this.csColors_2[i * this.csColorStep + 1],
          this.csColors_2[i * this.csColorStep + 2],
          1.0
        ]);
        gl.uniform4fv(this.standardUniLocation.csColor_3, [
          this.csColors_3[i * this.csColorStep + 0],
          this.csColors_3[i * this.csColorStep + 1],
          this.csColors_3[i * this.csColorStep + 2],
          1.0
        ]);
        // Time
        gl.uniform1f(this.standardUniLocation.time, this.currentTime); // 1fに第2引数不要
        gl.uniform1f(this.standardUniLocation.ratio, this.localPositionRatio); // テスト用 tweakPane, vert ratio削除
        // Mix Strength
        gl.uniform1f(
          this.standardUniLocation.transStrength_1,
          this.transStrength_1.value
        );
        gl.uniform1f(
          this.standardUniLocation.transStrength_2,
          this.transStrength_2.value
        );
        gl.uniform1f(
          this.standardUniLocation.transStrength_3,
          this.transStrength_3.value
        );

        gl.drawElements(gl.TRIANGLES, this.csGeoA.index.length, gl.UNSIGNED_SHORT, 0);
        // gl.drawArrays(gl.LINE_LOOP, 0, this.csGeoA.position.length / 3);
        // gl.drawArrays(gl.POINTS, 0, this.csGeoA.position.length / 3);
      }
    }
  }

  // 'num' matches model matrix index (ex. modelMatrix_1)
  transStrength(num) {
    let tmpTrConf;

    tmpTrConf = num === 1 ? this.transConfig[1] : this.transConfig[0];
    gsap.to(this.transStrength_1, tmpTrConf);

    tmpTrConf = num === 2 ? this.transConfig[1] : this.transConfig[0];
    gsap.to(this.transStrength_2, tmpTrConf);

    // if(num === 2) {
    //   let gsapOp = {...this.transConfig[1]};
    //   // gsapOp.duration = gsapOp.duration / 2;
    //   gsapOp.onComplete = () => {
    //     this.countUp();
    //   };
    //   gsap.to(this.transStrength_2, gsapOp);
    // } else {
    //   gsap.to(this.transStrength_2, this.transConfig[0]);
    // }

    // if(num === 2) {
    //   gsap.timeline()
    //     .to(this.transStrength_2, this.transConfig[3])
    //     .to(this.transStrength_2, this.transConfig[2]);
    // } else {
    //   gsap.to(this.transStrength_2, this.transConfig[0]);
    // }

    // Test
    // tl
    //   .to(this.transStrength_test, {
    //     duration: .5 / 2,
    //     ease: 'power4.inOut',
    //     value : 1.
    //   })
    //   .to(this.transStrength_test, {
    //     duration: .5 / 2,
    //     ease: 'power4.inOut',
    //     value : 0.
    //   })

    tmpTrConf = num === 3 ? this.transConfig[1] : this.transConfig[0];
    gsap.to(this.transStrength_3, tmpTrConf);
  }

  // Transitioning Number Count Up
  autoPlay(time) {
    // Tansitionとフォーメーションの時間を変える
    // n秒毎 && 奇数の時実行
    if(Math.floor(time) % this.transCountInterval === 0){
      if(this.countFlg) {
        if (this.transCountNow >= this.transCountMax) this.transCountNow = 1;
        else this.transCountNow++;
        this.transStrength(this.transCountNow);
        this.countFlg = !this.countFlg;
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