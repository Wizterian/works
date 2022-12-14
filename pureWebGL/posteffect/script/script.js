
// = 018 ======================================================================
// ポストエフェクトには、たくさんのバリエーションがあります。
// というより、やれることは無限にあるので、まずは基本的なところから少しずつ感覚
// を掴んでいくのがよいでしょう。
// ここでは一度オフスクリーンでシーンをレンダリング（スフィアを使った描画）を行
// い、続いてこれを「画面全体を覆う板ポリゴン」に貼り付けて画面に出しています。
// この板ポリゴンが描画される２度目のレンダリングにおいて、シェーダでポストエフ
// ェクトを掛けている形です。
// 具体的なエフェクトの内容としては、ベクトルの内積を活用したグレイスケール化と、
// 画面の四隅が暗くなるような効果（ヴィネット）をポストエフェクトで実装していま
// す。いずれも、ベクトルが絡んできますので数学的思考が要求されますが、落ち着い
// て読み解きましょう。
// ============================================================================

import {WebGLUtility}     from './webgl.js';
import {WebGLMath}        from './math.js';
import {WebGLGeometry}    from './geometry.js';
import {WebGLOrbitCamera} from './camera.js';
import {hslToRgb}         from './utils.js';
import '../../lib/tweakpane-3.1.0.min.js';

/*************************************************
基本設定
*************************************************/
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  app.load()
  .then(() => {
    app.setupGeometry();
    app.setupLocation();
    app.start();
  });

  // Tweakpane を使った GUI の設定
  const pane = new Tweakpane.Pane();
  const parameter = {normal: false};
  pane.addInput(parameter, 'normal')
  .on('change', (v) => {
    app.setNormalVisibility(v.value);
  });
}, false);

/**
 * アプリケーション管理クラス
 */
class App {
  /**
   * @constructor
   */
  constructor() {
    this.canvas = null;
    this.gl = null;
    /**
     * plane ジオメトリの情報を保持するオブジェクト
     */
    this.planeGeometry = null;
    this.planeVBO = null;
    this.planeIBO = null;

    this.startTime = null;
    this.camera = null;
    /**
     * フレームバッファ関連オブジェクトの格納用
     */
    this.framebufferArray = [];

    this.isRender = false;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    // 立方体
    this.cubeGeo = null;
    this.cubeVBO = null;
    this.cubeIBO = null;
    this.cubePositions = null;
    this.cubePosStep = null;
    this.cubeNum = null;
    this.cubeAxises = null;
    this.cubeAxisStep = null;
    this.cubeRotTimeScales = null;
    this.cubeColorStep = null;
    this.cubeColors = null;

    // 輝度検出用
    this.luminanceAttrLocation = null;
    this.luminanceProgram = null;
    this.luminanceAttrStride = null;
    this.luminanceUniLocation = null;
    this.luminanceProgram = null;

    // 通常描画
    this.standardAttrLocation = null;
    this.standardAttrStride = null;
    this.standardUniLocation = null;
    this.standardProgram = null;

    // ぼかし描画
    this.blurAttrLocation = null;
    this.blurProgram = null;
    this.blurAttrStride = null;
    this.blurUniLocation = null;

    // 加算描画
    this.addAttrLocation = null;
    this.addProgram = null;
    this.addAttrStride = null;
    this.addUniLocation = null;

    // 他パラメータ
    this.ambientLight = 0.2; // Neon
    this.luminance = 0.2;
    this.gaussStrength = 100.0; // Blur
    this.addStrength = 0.33; // Add
    this.currentY = 0;

    // Tweak Pane
    this.normalVisibility = null;
  }

  /**
   * 初期化処理を行う
   */
  /*************************************************
  WebGL Canvas、カメラ、リサイズ、かリング、深度設定 etc.
  *************************************************/
  init() {
    // canvasとWebGLコンテキストの取得
    this.canvas = document.getElementById('webgl-canvas');
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    // カメラ制御用インスタンスを生成する
    const cameraOption = {
      distance: 5.0, // Z 軸上の初期位置までの距離
      min: 1.0,      // カメラが寄れる最小距離
      max: 10.0,     // カメラが離れられる最大距離
      move: 2.0,     // 右ボタンで平行移動する際の速度係数
    };
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption);

    // 最初に一度リサイズ処理を行っておく（ここで結果的にフレームバッファが生成される） @@@
    this.resize();

    // リサイズイベントの設定
    window.addEventListener('resize', this.resize, false);

    // 座標取得
    window.addEventListener('mousemove', e => {
      this.getMousePosition(e);
    }, false);

    // ガウス係数を最初に一度求めておく @@@
    this.calcGaussWeight(this.gaussStrength);

    // バックフェイスカリングと深度テストは初期状態で有効
    /*************************************************
    裏側の表示や透明度と関連 6回サンプル10
    */
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  /**
   * リサイズ処理
   */
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // フレームバッファもサイズをキャンバスに合わせる @@@
    if (this.framebufferArray != null) {
      this.framebufferArray.forEach((buffer) => {
        WebGLUtility.deleteFramebuffer(
          this.gl,
          buffer.framebuffer,
          buffer.renderbuffer,
          buffer.texture,
        );
      });
    }

    // 削除したあとに新しくフレームバッファを生成する
    for(let i = 0; i < 4; i += 1) {
      this.framebufferArray.push(
        WebGLUtility.createFramebuffer(this.gl, this.canvas.width, this.canvas.height)
      );
    }
    this.framebufferArray = [
      WebGLUtility.createFramebuffer(this.gl, this.canvas.width, this.canvas.height),
      WebGLUtility.createFramebuffer(this.gl, this.canvas.width, this.canvas.height),
      WebGLUtility.createFramebuffer(this.gl, this.canvas.width, this.canvas.height),
      WebGLUtility.createFramebuffer(this.gl, this.canvas.width, this.canvas.height),
    ]
  }

  getMousePosition(e) {
    // const clamp = (num, min = 0.0, max = 1.0) => Math.min(Math.max(num, min), max);
    const targetY = 1 - e.clientY / window.innerHeight;
    this.currentY += (targetY - this.currentY) * 0.1

    this.addStrength = this.currentY / 3;
    // this.addStrength = clamp(currentY, 0.1, 0.5);
    this.ambientLight = this.currentY / 5;
    this.calcGaussWeight(this.currentY * 200);
  }

  /**
   * 各種リソースのロードを行う
   * @return {Promise}
   */
  load() {
    return new Promise((resolve, reject) => {
      const gl = this.gl;
      if (gl == null) {
        const error = new Error('not initialized');
        reject(error);
      } else {
        let vs = null;
        let fs = null;
        /*************************************************
        Shaderの読み込みとprogramの生成
        *************************************************/
        // 輝度検出
        WebGLUtility.loadFile('./shader/luminance.vert')
        .then((vertexShaderSource) => {
          vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
          return WebGLUtility.loadFile('./shader/luminance.frag');
        })
        // ぼかし
        .then((fragmentShaderSource) => {
          fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
          this.luminanceProgram = WebGLUtility.createProgramObject(gl, vs, fs);
          return WebGLUtility.loadFile('./shader/blur.vert');
        })
        .then((vertexShaderSource) => {
          vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
          return WebGLUtility.loadFile('./shader/blur.frag');
        })
        // 加算
        .then((fragmentShaderSource) => {
          fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
          this.blurProgram = WebGLUtility.createProgramObject(gl, vs, fs);
          return WebGLUtility.loadFile('./shader/add.vert');
        })
        .then((vertexShaderSource) => {
          vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
          return WebGLUtility.loadFile('./shader/add.frag');
        })
        // 通常表示
        .then((fragmentShaderSource) => {
          fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
          this.addProgram = WebGLUtility.createProgramObject(gl, vs, fs);
          return WebGLUtility.loadFile('./shader/standard.vert');
        })
        .then((vertexShaderSource) => {
          vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
          return WebGLUtility.loadFile('./shader/standard.frag');
        })
        .then((fragmentShaderSource) => {
          fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
          this.standardProgram = WebGLUtility.createProgramObject(gl, vs, fs);
          resolve();
        })
      }
    });
  }

  /**
   * Normalの可視性を設定する
   * @param {boolean} flag - 設定する値
   */
   setNormalVisibility(flag) {
    this.normalVisibility = flag? 1: 0;
  }

  /**
   * ガウス係数を算出する @@@
   * @param {number} strength - ブラーの強さ
   */
  calcGaussWeight(strength) {
    // この RESOLUTION がシェーダのなかでループする回数と同じになる
    // ※つまりこの手法ではどうしてもハードコーディングが必要になります
    /*************************************************
    Frag Shader内の配列の長さ（収集ピクセル範囲）が定数のため
    */
    const RESOLUTION = 20;

    // ガウス係数を算出
    /*************************************************
    色を混ぜる割合（中心から釣鐘状の分布）8回P86 一旦、便利関数として利用
    */
    const weight = [];
    let total = 0.0;
    for (let i = 0; i < RESOLUTION; ++i) {
      const r = 1.0 + 2.0 * i;
      let c = Math.exp(-0.5 * (r * r) / strength);
      weight[i] = c;
      if (i > 0) {
        c *= 2.0;
      }
      total += c;
    }

    // ガウシアンブラーの強さ
    this.gaussStrength = strength;

    // ウェイト総量で割って正規化したものを使う
    /*************************************************
    配列を返却
    */
    this.gaussWeight = weight.map((v) => {
      return v / total;
    });
  }

  /**
   * 頂点属性（頂点ジオメトリ）のセットアップを行う
   */
  /*************************************************
  Geometryから各各頂点属性生成
  *************************************************/
  setupGeometry() {
    const color = [1.0, 1.0, 1.0, 1.0];
    const size = 2.0;
    /*************************************************
    Plane GeometryのVBO・IBO生成
    *************************************************/
    this.planeGeometry = WebGLGeometry.plane(size, size, color);
    this.planeVBO = [
      WebGLUtility.createVBO(this.gl, this.planeGeometry.position),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.texCoord),
    ];
    this.planeIBO = WebGLUtility.createIBO(this.gl, this.planeGeometry.index);

    /*************************************************
    Cube Geometry
    *************************************************/
    const cubeSize = 0.2;
    this.cubeGeo = WebGLGeometry.cube(cubeSize, color);
    this.cubeVBO = [
      WebGLUtility.createVBO(this.gl, this.cubeGeo.position),
      WebGLUtility.createVBO(this.gl, this.cubeGeo.normal),
      WebGLUtility.createVBO(this.gl, this.cubeGeo.color),
    ];
    this.cubeIBO = WebGLUtility.createIBO(this.gl, this.cubeGeo.index);

    /*************************************************
    他cube属性
    *************************************************/
    this.cubeNum = 400;

    // ランダム配置座標（中央に偏差）
    this.cubePosStep = 3;
    const radiationalScale = 5.0; // 拡散スケーリング
    this.cubePositions = new Float32Array(this.cubeNum * this.cubePosStep);
    for(let i = 0; i < this.cubeNum * this.cubePosStep; i += 1) {
      this.cubePositions[i * this.cubePosStep + 0] = ((((Math.random() + Math.random()) / 2) * 2) - 1) * radiationalScale;
      this.cubePositions[i * this.cubePosStep + 1] = ((((Math.random() + Math.random()) / 2) * 2) - 1) * radiationalScale;
      this.cubePositions[i * this.cubePosStep + 2] = ((((Math.random() + Math.random()) / 2) * 2) - 1) * radiationalScale;
    }

    // ランダム回転軸
    this.cubeAxisStep = 3;
    this.cubeAxises = new Float32Array(this.cubeNum * this.cubeAxisStep);
    for(let i = 0; i < this.cubeNum * this.cubeAxisStep; i += 1) {
      this.cubeAxises[i * this.cubeAxisStep + 0] = Math.floor(Math.random() * 2);
      this.cubeAxises[i * this.cubeAxisStep + 1] = Math.floor(Math.random() * 2);
      this.cubeAxises[i * this.cubeAxisStep + 2] = Math.floor(Math.random() * 2);
    }

    // ランダム回転速度
    this.cubeRotTimeScales = new Float32Array(this.cubeNum);
    for(let i = 0; i < this.cubeNum; i += 1) this.cubeRotTimeScales[i] = Math.random() * 0.001;

    // ランダム色
    this.cubeColorStep = 3;
    this.cubeColors = new Float32Array(this.cubeNum * this.cubeColorStep);
    for(let i = 0; i < this.cubeNum *this.cubeColorStep; i += 1) {
      const tmpRgb = hslToRgb((Math.random() * 135) + 75, 60, 80);
      this.cubeColors[i * this.cubeColorStep + 0] = tmpRgb.r;
      this.cubeColors[i * this.cubeColorStep + 1] = tmpRgb.g;
      this.cubeColors[i * this.cubeColorStep + 2] = tmpRgb.b;
    }
  }

  /**
   * 頂点属性のロケーションに関するセットアップを行う
   */
  setupLocation() {
    const gl = this.gl;
    /*************************************************
    輝度検出（luminance program）
    *************************************************/
    this.luminanceAttrLocation = [
      gl.getAttribLocation(this.luminanceProgram, 'position'),
      gl.getAttribLocation(this.luminanceProgram, 'texCoord'),
    ];
    this.luminanceAttrStride = [3, 2];

    this.luminanceUniLocation = {
      textureUnit: gl.getUniformLocation(this.luminanceProgram, 'textureUnit'),
      minLuminance: gl.getUniformLocation(this.luminanceProgram, 'minLuminance'), // 輝度しきい値
    };

    /*************************************************
    ぼかし描画（blur program）
    *************************************************/
    this.blurAttrLocation = [
      gl.getAttribLocation(this.blurProgram, 'position'),
      gl.getAttribLocation(this.blurProgram, 'texCoord'),
    ];
    this.blurAttrStride = [3, 2];

    this.blurUniLocation = {
      textureUnit: gl.getUniformLocation(this.blurProgram, 'textureUnit'), // テクスチャユニット
      resolution: gl.getUniformLocation(this.blurProgram, 'resolution'),   // 解像度
      horizontal: gl.getUniformLocation(this.blurProgram, 'horizontal'),   // 水平に処理するかどうか @@@
      weight: gl.getUniformLocation(this.blurProgram, 'weight'),           // ガウス係数の配列 @@@
    };

    /*************************************************
    加算描画（add program）
    *************************************************/
    this.addAttrLocation = [
      gl.getAttribLocation(this.addProgram, 'position'),
      gl.getAttribLocation(this.addProgram, 'texCoord'),
    ];
    this.addAttrStride = [3, 2];

    this.addUniLocation = {
      texture0: gl.getUniformLocation(this.addProgram, 'texture0'), // テクスチャ1
      texture1: gl.getUniformLocation(this.addProgram, 'texture1'),   // テクスチャ2
      strength: gl.getUniformLocation(this.addProgram, 'strength'),   // 加算強度
    };

    /*************************************************
    通常描画（standard program）
    *************************************************/
    this.standardAttrLocation = [
      gl.getAttribLocation(this.standardProgram, 'position'),
      gl.getAttribLocation(this.standardProgram, 'normal'),
      gl.getAttribLocation(this.standardProgram, 'color'),
    ];
    this.standardAttrStride = [3, 3, 4];
    this.standardUniLocation = {
      mvpMatrix: gl.getUniformLocation(this.standardProgram, 'mvpMatrix'), // MVP 行列
      normalMatrix: gl.getUniformLocation(this.standardProgram, 'normalMatrix'), // 法線変換用行列
      ambientLight: gl.getUniformLocation(this.standardProgram, 'ambientLight'), // ライトベクトル
      lightVector: gl.getUniformLocation(this.standardProgram, 'lightVector'), // 環境光
      cubeColor: gl.getUniformLocation(this.standardProgram, 'cubeColor'),
      normalVisibility: gl.getUniformLocation(this.standardProgram, 'normalVisibility'),
    };
  }

  /**
   * オフスクリーンレンダリングのためのセットアップを行う
   */
  /*************************************************
  通常レンダリング
  *************************************************/
  setupStandardRendering() {
    const gl = this.gl;
    // フレームバッファをバインドして描画の対象とする
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferArray[0].framebuffer);
    // ビューポートを設定する
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // クリアする色と深度を設定する
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    // 色と深度をクリアする
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // プログラムオブジェクトを選択
    gl.useProgram(this.standardProgram);
  }

  /*************************************************
  高輝度検出パス
  *************************************************/
  setupLuminanceRendering() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferArray[1].framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.luminanceProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferArray[0].texture);
  }

  /*************************************************
  bloom ぼかし横
  *************************************************/
  setupBlurRenderingH() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferArray[2].framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.blurProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferArray[1].texture);
  }

  /*************************************************
  bloom ぼかし縦
  *************************************************/
  setupBlurRenderingV() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferArray[3].framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.blurProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferArray[2].texture);
  }

  /*************************************************
  加算 最後にdefaultのframeBuffer出力（nullで出力）
  *************************************************/
  setupAddRendering() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.addProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferArray[0].texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferArray[3].texture);
  }

  /**
   * 描画を開始する
   */
  start() {
    const gl = this.gl;
    // レンダリング開始時のタイムスタンプを取得しておく
    this.startTime = Date.now();
    // レンダリングを行っているフラグを立てておく
    this.isRender = true;
    // レンダリングの開始
    this.render();
  }

  /**
   * 描画を停止する
   */
  stop() {
    this.isRender = false;
  }

  /**
   * レンダリングを行う
   */
  render() {
    const gl = this.gl;
    const m4 = WebGLMath.Mat4;
    const v3 = WebGLMath.Vec3;

    // レンダリングのフラグの状態を見て、requestAnimationFrame を呼ぶか決める
    if (this.isRender === true) {
      requestAnimationFrame(this.render);
    }

    // 現在までの経過時間
    const nowTime = (Date.now() - this.startTime);

    // 1フレームの間に複数回レンダリングする
    /*************************************************
    通常描画
    *************************************************/
    {
      // レンダリングのセットアップ
      this.setupStandardRendering();
      // 通常描画用のビュー行列を作る
      const v = this.camera.update();
      // 通常描画用のプロジェクション行列を作る
      const fovy   = 45;
      const aspect = window.innerWidth / window.innerHeight;
      const near   = 0.1
      const far    = 20.0;
      const p = m4.perspective(fovy, aspect, near, far);
      // 通常描画用のビュー・プロジェクション行列
      const vp = m4.multiply(p, v);

      /************************************
      Geometry 参照生成・有効化するだけぽいので一つ用意
      */
      WebGLUtility.enableBuffer(gl, this.cubeVBO, this.standardAttrLocation, this.standardAttrStride, this.cubeIBO);

      /************************************
      一つの行列（動き）の乗算を繰り返し多様な動きを生成
      一つの要素の動きでイメージ（回転優先）
      */
      const timeScale = 0.0001;
      let m;
      for(let i = 0; i < this.cubeNum; i++) {
        // 行列の単位化もしくは生成
        m = m4.identity();
        // 全体の回転
        m = m4.rotate(m, nowTime * timeScale, v3.create(0.0, 0.0, 1.0));
        m = m4.rotate(m, nowTime * timeScale, v3.create(1.0, 1.0, 0.0));
        // 個々を中心からランダム回転
        m = m4.rotate(m, nowTime * this.cubeRotTimeScales[i], v3.create(
          this.cubeAxises[i * this.cubeAxisStep + 0],
          this.cubeAxises[i * this.cubeAxisStep + 1],
          // this.cubeAxises[i * this.cubeAxisStep + 2],
          1.0 // 全部変数にするとなぜか不安定 ※処理の遅延？ frameBufferをresize時forで生成したらエラーが出たので同じ種類のエラー？
        ));
        // 個々の配置
        m = m4.translate(m, v3.create(
          this.cubePositions[i * this.cubePosStep + 0],
          this.cubePositions[i * this.cubePosStep + 1],
          this.cubePositions[i * this.cubePosStep + 2]
        ));
        // 個々の回転
        m = m4.rotate(m, nowTime * this.cubeRotTimeScales[i], v3.create(
          this.cubeAxises[i * this.cubeAxisStep + 0],
          this.cubeAxises[i * this.cubeAxisStep + 1],
          1.0 // 変数にすると不安定
        ));
 
        // 通常描画用の MVP 行列
        const mvp = m4.multiply(vp, m);
        const normalMatrix = m4.transpose(m4.inverse(m));

        gl.uniformMatrix4fv(this.standardUniLocation.mvpMatrix, false, mvp);
        gl.uniformMatrix4fv(this.standardUniLocation.normalMatrix, false, normalMatrix);
        gl.uniform3fv(this.standardUniLocation.lightVector, v3.create(0.0, 0.0, 1.0));
        gl.uniform4fv(this.standardUniLocation.ambientLight, [
          this.ambientLight,
          this.ambientLight,
          this.ambientLight,
          this.ambientLight
        ]);
        gl.uniform4fv(this.standardUniLocation.cubeColor, [
          this.cubeColors[i * this.cubeColorStep + 0],
          this.cubeColors[i * this.cubeColorStep + 1],
          this.cubeColors[i * this.cubeColorStep + 2],
          1.0
        ]);
        gl.uniform1i(this.standardUniLocation.normalVisibility, this.normalVisibility);
        // 描画
        gl.drawElements(gl.TRIANGLES, this.cubeGeo.index.length, gl.UNSIGNED_SHORT, 0);
      }
    }

    /*************************************************
    高輝度検出パス
    *************************************************/
    {
      // レンダリングのセットアップ
      this.setupLuminanceRendering();
      // VBO と IBO
      WebGLUtility.enableBuffer(gl, this.planeVBO, this.luminanceAttrLocation, this.luminanceAttrStride, this.planeIBO);
      // シェーダに各種パラメータを送る
      gl.uniform1i(this.luminanceUniLocation.textureUnit, 0);
      gl.uniform1f(this.luminanceUniLocation.minLuminance, this.luminance); // 輝度検出しきい値
      // 描画
      gl.drawElements(gl.TRIANGLES, this.planeGeometry.index.length, gl.UNSIGNED_SHORT, 0);
    }
    /*************************************************
    bloom ぼかし横
    *************************************************/
    {
      this.setupBlurRenderingH();
      WebGLUtility.enableBuffer(gl, this.planeVBO, this.blurAttrLocation, this.blurAttrStride, this.planeIBO);

      gl.uniform1i(this.blurUniLocation.textureUnit, 0);
      gl.uniform2fv(this.blurUniLocation.resolution, [this.canvas.width, this.canvas.height]);
      gl.uniform1i(this.blurUniLocation.horizontal, true);
      gl.uniform1fv(this.blurUniLocation.weight, this.gaussWeight);

      gl.drawElements(gl.TRIANGLES, this.planeGeometry.index.length, gl.UNSIGNED_SHORT, 0);
    }
    /*************************************************
    bloom ぼかし縦
    *************************************************/
    {
      this.setupBlurRenderingV();
      WebGLUtility.enableBuffer(gl, this.planeVBO, this.blurAttrLocation, this.blurAttrStride, this.planeIBO);

      gl.uniform1i(this.blurUniLocation.textureUnit, 0);
      gl.uniform2fv(this.blurUniLocation.resolution, [this.canvas.width, this.canvas.height]);
      gl.uniform1i(this.blurUniLocation.horizontal, false);
      gl.uniform1fv(this.blurUniLocation.weight, this.gaussWeight);

      gl.drawElements(gl.TRIANGLES, this.planeGeometry.index.length, gl.UNSIGNED_SHORT, 0);
    }
    /*************************************************
    加算
    *************************************************/
    {
      this.setupAddRendering();
      WebGLUtility.enableBuffer(gl, this.planeVBO, this.addAttrLocation, this.addAttrStride, this.planeIBO);

      gl.uniform1i(this.addUniLocation.texture0, 0);
      gl.uniform1i(this.addUniLocation.texture1, 1);
      gl.uniform1f(this.addUniLocation.strength, this.addStrength); // 加算強度をマウスX軸連動

      gl.drawElements(gl.TRIANGLES, this.planeGeometry.index.length, gl.UNSIGNED_SHORT, 0);
    }
  }
}
