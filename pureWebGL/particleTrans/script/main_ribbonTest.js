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
    // this.gl.enable(this.gl.CULL_FACE); // 後でつける
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

    this.pCount = 2;

    /****************************************
    Ball
    */
    {
      // Geometry
      this.ballGeo = WebGLGeometry.sphere(
        6, 6,
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
      // 極に集中してしまう
      // https://techblog.kayac.com/how-to-distribute-points-randomly-using-high-school-math
      const BALL_RADIUS = 1.25;
      this.ballTempPos = [];
      this.ballTempCol = [];
      for (let i = 0; i < this.pCount; i += 1) {
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
    }

    /****************************************
    Cube
    */
    {
      // Geometry
      this.cubeGeo = WebGLGeometry.cube(1 / 20, [1, 0, 1, 1]);

      this.cubeVBO = [
        WebGLUtility.createVBO(this.gl, this.cubeGeo.position),
        WebGLUtility.createVBO(this.gl, this.cubeGeo.normal),
        WebGLUtility.createVBO(this.gl, this.cubeGeo.color),
      ];
      this.cubeIBO = WebGLUtility.createIBO(this.gl, this.cubeGeo.index);

      // Position & Color
      this.cubePosStep = 3;
      this.cubeColStep = 4;

      const CUBE_EDGE = 1;
      this.cubeTempPos = [];
      this.cubeTempCol = [];
      for (let i = 0; i < this.pCount; i += 1) {
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

    /****************************************
    TestTube2Geo生成
    */
    // {
    //   this.cube2Pos = [];
    //   this.cube2Col = [];
    //   this.cube2Indices = [];
    //   this.cube2Normal = [];

    //   const zoukaY = 0.0025;// 1°でy軸の増加
    //   const tubeLaps = 2;// 何周するか
    //   const tubeDeg = 10;// 何度ずつ頂点を置くか
    //   const tubeRad = 2;// 周回の半径
    //   const tubeRound = tubeLaps * 360; // 全周分の角度
    //   const circleR = 0.5; // 切断面の太さ
    //   const circleVrt = 4; //切断面(多角形)の頂点数
    //   const circleDeg = 360 / circleVrt; //切断面(多角形)の中心角

    //   //周回10度毎ループ
    //   for(let i = 0; i <= tubeRound; i = i + tubeDeg){
    //     //切断面生成ループ
    //     for(let j = 0; j < circleVrt; j++){
    //       // 切断面j頂点x、zのローカル座標
    //       const incXZ = circleR / 2 * Math.sin(Math.PI / 180 * (circleDeg * j));
    //       // 切断面j頂点yのローカル座標
    //       const incY = circleR / 2 * Math.cos(Math.PI / 180 * (circleDeg * j));
    //       const x = (tubeRad + incXZ) * Math.cos(Math.PI / 180 * i);
    //       const z = (tubeRad+ incXZ) * Math.sin(Math.PI / 180 * i);
    //       const y = (i * zoukaY) + incY;
    //       this.cube2Pos.push(x, y, z);
    //       this.cube2Col.push(1, 1, 0, 1);
    //     }
    //   }

    //   const cubeVLength = this.cube2Pos.length; //頂点の数
    //   //切断面の数分ループ
    //   for(let i = 0; i < (cubeVLength / circleVrt) - 1; i++){
    //     //切断面の頂点数分ループ
    //     for(let j = 0; j < circleVrt; j++){
    //       //現在:i切断面目のｊ番目頂点
    //       //(次の切断面のj番目頂点,i番目切断面の次の頂点,i番目切断面のj番目の頂点)
    //       this.cube2Indices.push(
    //         (i + 1) * circleVrt + j,
    //         i * circleVrt + j + 1,
    //         i * circleVrt + j
    //       );
    //       //最後のループ時は面を作らない
    //       //(次の切断面の次の頂点,i番目切断面の次の頂点,次の切断面のj番目の頂点)
    //       if(i != (cubeVLength / circleVrt) - 2 || j != circleVrt - 1){
    //         this.cube2Indices.push(
    //           (i + 1) * circleVrt + j + 1,
    //           i * circleVrt + j + 1,
    //           (i + 1) * circleVrt + j
    //         )
    //       };
    //     }
    //   }

    //   // const v = 1.0 / Math.sqrt(3.0);
    //   // for(let i = 0; i < this.cube2Pos.length; i++){
    //   //   this.cube2Normal.push(
    //   //     -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,  v,
    //   //     -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v, -v,
    //   //     -v,  v, -v, -v,  v,  v,  v,  v,  v,  v,  v, -v,
    //   //     -v, -v, -v,  v, -v, -v,  v, -v,  v, -v, -v,  v,
    //   //      v, -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,
    //   //     -v, -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v,
    //   //     );
    //   // }

    //   // // // zは1辺を分割 x、zを面として扱う
    //   // this.cube2Pos = [
    //   //   // 1つ目 上 黄
    //   //   -0.1,  0.1, -.05, // 左上
    //   //    0.1,  0.1, -.05, // 右上
    //   //   -0.1, -0.1, -.05, // 左下
    //   //    0.1, -0.1, -.05, // 右下
    //   //   // 2つ目 真ん中 赤
    //   //   -0.1,  0.1, 0, // 左上
    //   //    0.1,  0.1, 0, // 右上
    //   //   -0.1, -0.1, 0, // 左下
    //   //    0.1, -0.1, 0, // 右下
    //   //   // 3つ目 下 青
    //   //   -0.1,  0.1, .05, // 左上
    //   //    0.1,  0.1, .05, // 右上
    //   //   -0.1, -0.1, .05, // 左下
    //   //    0.1, -0.1, .05, // 右下
    //   // ];
    //   // this.cube2Indices = [
    //   //   0, 1,  2,  2, 1,  3, // 1
    //   //   // 1, 5,  3,  3, 5,  7,
    //   //   4, 5,  6,  6, 5,  7, // 2
    //   //   8, 9, 10, 10, 9, 11, // 3
    //   // ];
    //   // this.cube2Color = [
    //   //   0, 1.0, 1.0, 1.0,
    //   //   0, 1.0, 1.0, 1.0,
    //   //   0, 1.0, 1.0, 1.0,
    //   //   0, 1.0, 1.0, 1.0,

    //   //   1.0, 0.0, 1.0, 1.0,
    //   //   1.0, 0.0, 1.0, 1.0,
    //   //   1.0, 0.0, 1.0, 1.0,
    //   //   1.0, 0.0, 1.0, 1.0,

    //   //   1.0, 1.0, 0.0, 1.0,
    //   //   1.0, 1.0, 0.0, 1.0,
    //   //   1.0, 1.0, 0.0, 1.0,
    //   //   1.0, 1.0, 0.0, 1.0,
    //   // ];
    //   const v = 1.0 / Math.sqrt(3.0);
    //   this.cube2Normal = [
    //     -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,  v,
    //     -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v, -v,
    //     -v,  v, -v, -v,  v,  v,  v,  v,  v,  v,  v, -v,
    //     -v, -v, -v,  v, -v, -v,  v, -v,  v, -v, -v,  v,
    //     v, -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,
    //     -v, -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v
    //   ];
    //   this.cube2VBO = [
    //     WebGLUtility.createVBO(this.gl, this.cube2Pos),
    //     WebGLUtility.createVBO(this.gl, this.cube2Normal),
    //     WebGLUtility.createVBO(this.gl, this.cube2Col),
    //   ];
    //   this.cube2IBO = WebGLUtility.createIBO(this.gl, this.cube2Indices);
    // }


    /****************************************
    screwGeo生成
    */
    // {
    //   this.screwPos = [];
    //   this.screwColor = [];
    //   this.screwIndices = [];
    //   const circleVrt = 20;
    //   const tubeSec = 3;
    //   const tubeR = .001;
    //   const fromCenter = .01;

    //   // 断面（Cross Section）−1〜1の座標
    //   for(let i = 0; i <= circleVrt; i++){
    //     const circleR = Math.PI * 2 / circleVrt * i;
    //     const circleX = Math.cos(circleR);
    //     const circleY = Math.sin(circleR);

    //     for(let j = 0; j <= tubeSec; j++){
    //       const tubeR = Math.PI * 2 / tubeSec * j;
    //       const tubeX = (circleX * tubeR + fromCenter) * Math.cos(tubeR);
    //       const tubeY = circleY * tubeR;
    //       const tubeZ = (circleX * tubeR + fromCenter) * Math.sin(tubeR);
    //       this.screwPos.push(tubeX, tubeY, tubeZ);

    //       // const tc = hsva(360 / tubeSec * j, 1, 1, 1);
    //       this.screwColor.push(1, 0, 1, 1);
    //     }
    //   }
    //   for(let i = 0; i < circleVrt; i++){
    //     for(let j = 0; j < tubeSec; j++){
    //       const r = (tubeSec + 1) * i + j;
    //       this.screwIndices.push(r, r + tubeSec + 1, r + 1);
    //       this.screwIndices.push(r + tubeSec + 1, r + tubeSec + 2, r + 1);
    //     }
    //   }

    //   // this.screwIndices = [
    //   //   0, 1,  2,  2, 1,  3, // 1
    //   //   // 1, 5,  3,  3, 5,  7,
    //   //   4, 5,  6,  6, 5,  7, // 2
    //   //   8, 9, 10, 10, 9, 11, // 3
    //   // ];
    //   // zは1辺を分割 x、zを面として扱う
    //   // this.screwPos = [
    //   //   // 1つ目 上 黄
    //   //   -0.1,  0.1, -.05, // 左上
    //   //    0.1,  0.1, -.05, // 右上
    //   //   -0.1, -0.1, -.05, // 左下
    //   //    0.1, -0.1, -.05, // 右下
    //   //   // 2つ目 真ん中 赤
    //   //   -0.1,  0.1, 0, // 左上
    //   //    0.1,  0.1, 0, // 右上
    //   //   -0.1, -0.1, 0, // 左下
    //   //    0.1, -0.1, 0, // 右下
    //   //   // 3つ目 下 青
    //   //   -0.1,  0.1, .05, // 左上
    //   //    0.1,  0.1, .05, // 右上
    //   //   -0.1, -0.1, .05, // 左下
    //   //    0.1, -0.1, .05, // 右下
    //   // ];
    //   // this.screwColor = [
    //   //   0, 1.0, 1.0, 1.0,
    //   //   0, 1.0, 1.0, 1.0,
    //   //   0, 1.0, 1.0, 1.0,
    //   //   0, 1.0, 1.0, 1.0,

    //   //   1.0, 0.0, 1.0, 1.0,
    //   //   1.0, 0.0, 1.0, 1.0,
    //   //   1.0, 0.0, 1.0, 1.0,
    //   //   1.0, 0.0, 1.0, 1.0,

    //   //   1.0, 1.0, 0.0, 1.0,
    //   //   1.0, 1.0, 0.0, 1.0,
    //   //   1.0, 1.0, 0.0, 1.0,
    //   //   1.0, 1.0, 0.0, 1.0,
    //   // ];
    //   const v = 1.0 / Math.sqrt(3.0);
    //   this.screwNormal = [
    //     -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,  v,
    //     -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v, -v,
    //     -v,  v, -v, -v,  v,  v,  v,  v,  v,  v,  v, -v,
    //     -v, -v, -v,  v, -v, -v,  v, -v,  v, -v, -v,  v,
    //     v, -v, -v,  v,  v, -v,  v,  v,  v,  v, -v,  v,
    //     -v, -v, -v, -v, -v,  v, -v,  v,  v, -v,  v, -v

    //   ];
    //   this.screwVBO = [
    //     WebGLUtility.createVBO(this.gl, this.screwPos),
    //     // WebGLUtility.createVBO(this.gl, this.screwNormal),
    //     WebGLUtility.createVBO(this.gl, this.screwColor),
    //   ];
    //   this.screwIBO = WebGLUtility.createIBO(this.gl, this.screwIndices);
    // }


    /****************************************
    Wind
    */
    {
      // Position, Scale & Color
      this.windPosStep = 3;
      this.windSclStep = 3;
      this.windColStep = 4;

      const WIND_RADIUS = 1.5;
      const X_RISE = .025;
      const TWO_PI = Math.PI * 2;
      this.windTempPos = [];
      this.windTempRot = [];
      this.windTempScl = [];
      // this.windTempCol = [];

      for (let i = 0; i < this.pCount; i += 1) {
        const xRot = Math.random() * TWO_PI;;
        const xPos = (i * X_RISE) - ((X_RISE * this.pCount) / 2);
        this.windTempPos.push(xPos, WIND_RADIUS, 0);
        this.windTempRot.push(xRot);
        this.windTempScl.push(2, .1, 8);
      }
      this.windPositions = new Float32Array(this.windTempPos);
      this.windRotations = new Float32Array(this.windTempRot);
      this.windScales = new Float32Array(this.windTempScl);
      // this.windColors = new Float32Array(this.windTempCol);
    }
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
      // ambientLight: gl.getUniformLocation(this.standardProgram, 'ambientLight'), // 環境光
      // lightVector: gl.getUniformLocation(this.standardProgram, 'lightVector'), // ライトベクトル
      // ballColor: gl.getUniformLocation(this.standardProgram, 'ballColor'), // 色
      time: gl.getUniformLocation(this.standardProgram, 'time'), // 時間
    };
  }

  // FrameBuffer & ProgramObject
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

    const v = this.camera.update();
    const fovy   = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near   = 0.1
    const far    = 20.0;
    const p = m4.perspective(fovy, aspect, near, far);
    const vp = m4.multiply(p, v);

    // screw
    // {
    //   this.setupStandardRendering();

    //   WebGLUtility.enableBuffer(gl, this.screwVBO, this.standardAttrLocation, this.standardAttrStride, this.screwIBO);

    //   let m;
    //   for(let i = 0; i < this.pCount; i++) {
    //     m = m4.identity();
    //     // m = m4.rotate(m, this.currentTime, v3.create(1, 0, 0));
    //     m = m4.rotate(m, this.windRotations[i], v3.create(1, 0, 0));
    //     m = m4.translate(m, v3.create(
    //       this.windPositions[i * this.windPosStep + 0],
    //       this.windPositions[i * this.windPosStep + 1],
    //       this.windPositions[i * this.windPosStep + 2],
    //     ));
    //     const mvp = m4.multiply(vp, m);
    //     // const normalMatrix = m4.transpose(m4.inverse(m));

    //     gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
    //     // gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
    //     gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
    //     gl.drawElements(gl.TRIANGLES, this.screwIndices.length, gl.UNSIGNED_SHORT, 0);
    //     // gl.drawArrays(gl.LINE_LOOP, 0, this.screwIndices.length / 3);
    //   }
    // }

    // cube2描画
    {
      this.setupStandardRendering();

      WebGLUtility.enableBuffer(gl, this.cube2VBO, this.standardAttrLocation, this.standardAttrStride, this.cube2IBO);

      let m;
      for(let i = 0; i < this.pCount; i++) {
        m = m4.identity();
        // m = m4.rotate(m, this.currentTime, v3.create(1, 0, 0));
        // m = m4.rotate(m, this.windRotations[i], v3.create(1, 0, 0));
        m = m4.translate(m, v3.create(
          this.cube2Pos[i * this.windPosStep + 0],
          this.cube2Pos[i * this.windPosStep + 1],
          this.cube2Pos[i * this.windPosStep + 2],
        ));
        const mvp = m4.multiply(vp, m);
        const normalMatrix = m4.transpose(m4.inverse(m));

        gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        // gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
        gl.drawElements(gl.TRIANGLES, this.cube2Indices.length, gl.UNSIGNED_SHORT, 0);
      }
    }

    // リボン描画
    {
      this.setupStandardRendering();

      WebGLUtility.enableBuffer(gl, this.cubeVBO, this.standardAttrLocation, this.standardAttrStride, this.cubeIBO);

      let m;
      for(let i = 0; i < this.pCount; i++) {
        m = m4.identity();
        // m = m4.rotate(m, this.currentTime, v3.create(1, 0, 0));
        m = m4.rotate(m, this.windRotations[i], v3.create(1, 0, 0));
        m = m4.translate(m, v3.create(
          this.windPositions[i * this.windPosStep + 0],
          this.windPositions[i * this.windPosStep + 1],
          this.windPositions[i * this.windPosStep + 2],
        ));
        m = m4.scale(m, v3.create(
          this.windScales[i * this.windSclStep + 0],
          this.windScales[i * this.windSclStep + 1],
          this.windScales[i * this.windSclStep + 2],
        ));
        const mvp = m4.multiply(vp, m);
        const normalMatrix = m4.transpose(m4.inverse(m));

        gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
        // gl.drawElements(gl.TRIANGLES, this.cubeGeo.index.length, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.LINE_STRIP, 0, this.cubeGeo.position.length / 3);
      }
    }

    // 立方体描画
    // {
    //   this.setupStandardRendering();

    //   WebGLUtility.enableBuffer(gl, this.cubeVBO, this.standardAttrLocation, this.standardAttrStride, this.cubeIBO);

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
    //     gl.drawElements(gl.TRIANGLES, this.cubeGeo.index.length, gl.UNSIGNED_SHORT, 0);
    //   }
    // }

    // 球体描画
    // {
    //   this.setupStandardRendering();

    //   WebGLUtility.enableBuffer(gl, this.ballVBO, this.standardAttrLocation, this.standardAttrStride, this.ballIBO);

    //   let m;
    //   for(let i = 0; i < this.pCount; i++) {
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
    // gl.uniform1f(this.standardUniLocation.time, false, this.currentTime);
    //     gl.drawElements(gl.TRIANGLES, this.ballGeo.index.length, gl.UNSIGNED_SHORT, 0);
    //   }
    // }
  }
}
