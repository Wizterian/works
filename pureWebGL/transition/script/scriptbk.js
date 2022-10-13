
// = 011 ======================================================================
// three.js のサンプルでも利用した「テクスチャ」をピュアな WebGL で実装するとど
// のような手順になるのか、実際に体験してみましょう。
// テクスチャを導入する場合、覚えなくてはならないことがかなり多く出てきます。そ
// ういう意味では、テクスチャを「完全に理解して使いこなす」のはちょっとだけ大変
// です。
// 最初は、一度に覚えるのは困難な場合が多いので、とにかくじっくり、少しずつ慣れ
// ていくのがよいと思います。
// テクスチャを扱うために、webgl.js 側に新しく追加されたメソッドもありますので、
// 落ち着いて手順を確認していきましょう。
// ============================================================================

import {WebGLUtility}     from './webgl.js';
import {WebGLMath}        from './math.js';
import {WebGLGeometry}    from './geometry.js';
import {WebGLOrbitCamera} from './camera.js';
import '../../lib/tweakpane-3.1.0.min.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  app.load()
  .then(() => {
    app.setupGeometry();
    app.setupLocation();
    app.start();
  });
}, false);

/**
 * アプリケーション管理クラス
 */
class App {
  constructor() {
    this.canvas = null; // canvas DOM
    this.gl = null; // webGL context
    this.program = null; // shaderをまとめる
    this.attributeLocation = null; // attribute 変数のロケーション保持用配列
    this.attributeStride = null; // attribute 変数のストライドの配列
    this.uniformLocation = null; // uniform 変数のロケーションを保持
    this.planeGeometry = null; // plane ジオメトリの情報を保持
    this.planeVBO = null; // plane ジオメトリの VBO の配列
    this.planeIBO = null; // plane ジオメトリの IBO
    this.startTime = null; // レンダリング開始時のタイムスタンプ
    this.camera = null; // カメラ
    this.textures = []; // テクスチャ格納用
    this.isRender = false; // レンダリングを行うかどうかのフラグ
    this.textureVisibility = true; // テクスチャの可視性

    this.imageResolution = {x: 2048, y: 1024};
    // this.fitRatio = null;

    // this を固定するためのバインド処理
    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
  }

  /**
   * 初期化処理を行う
   */
  init() {
    // 基礎的処理
    this.canvas = document.getElementById('webgl-canvas');
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

    const cameraOption = {
      distance: 5.0, // Z 軸上の初期位置までの距離
      min: 1.0,      // カメラが寄れる最小距離
      max: 10.0,     // カメラが離れられる最大距離
      move: 2.0,     // 右ボタンで平行移動する際の速度係数
    };
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption);

    // リサイズイベント
    this.resize();
    window.addEventListener('resize', this.resize, false);

    // バックフェイスカリングと深度テストは初期状態で有効
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  // サイズ処理
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // 背景を画像でカバー
    // 画像とcanvasのアスペクト比を比較
    // 例. 画像2:1（横長）でcanvas4:1（超横長）なら、画像を幅を合わせ（1.0:0.5）
    // 例. 画像2:1（横長）でcanvas1:2（縦長）なら画像を高さ合わせ（0.25:1.0）

    // this.fitRatio = {
    //   x: Math.min((this.canvas.width / this.canvas.height) / (this.imageResolution.x / this.imageResolution.y), 1.0),
    //   y: Math.min((this.canvas.height / this.canvas.width) / (this.imageResolution.y / this.imageResolution.x), 1.0)
    // }
  }

  // 各種リソース準備（詳しく確認していく）
  load() {
    return new Promise((resolve, reject) => {

      /*****************************************
       * 0. Shader読み込み
       * Canvas（WebGL Context）確認 → 2つのShaderの読み込み
       * プログラムオブジェクトにまとめ、vsとfsを一組みとして取り扱えるよう紐付け
      *****************************************/

      const gl = this.gl;
      if (gl == null) {
        const error = new Error('not initialized');
        reject(error);
      } else {
        let vs = null;
        let fs = null;

        WebGLUtility.loadFile('./shader/main.vert')
          .then((vertexShaderSource) => {
            vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
            return WebGLUtility.loadFile('./shader/main.frag');
          })
          .then((fragmentShaderSource) => {
            fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
            this.program = WebGLUtility.createProgramObject(gl, vs, fs);

            // 画像の読み込み @@@
            /*****************************************
             * 1. 要複数画像読み込み
             * 読み込み完了 → テクスチャ生成へ
            *****************************************/

            const imgs = [ './thumb1.jpg', './thumb2.jpg', './displacement.jpg' ];
            const loadedImgs = [];
            new Promise((resolve) => {
              imgs.forEach(img => {
                loadedImgs.push(WebGLUtility.loadImage(img));
                if(loadedImgs.length === imgs.length) resolve(loadedImgs);
              });
            });
            return Promise.all(loadedImgs) // 複数プロミスを単一化し解決
          })
          .then((loadedImgs) => {

            // 読み込んだ画像からテクスチャを生成 @@@
            /*****************************************
             * 2. 複数のテクスチャ生成
             * 画像のVBOをbindするようなもの 第7回15P
             * https://wgld.org/d/webgl/w027.html
            *****************************************/

            loadedImgs.forEach(img => this.textures.push(WebGLUtility.createTexture(gl, img)));
            resolve();
          });
      }
    });
  }

  /**
   * 頂点属性（頂点ジオメトリ）のセットアップを行う
   */
  setupGeometry() {

    /*****************************************
     * 3. Geometry生成
     * 頂点属性を配列で生成 → VBOに格納
    *****************************************/

    const size = 1.0;
    const color = [1.0, 1.0, 1.0, 1.0];
    this.planeGeometry = WebGLGeometry.plane(size, size * .5, color);
    // 属性ごとにVBO用意
    this.planeVBO = [
      WebGLUtility.createVBO(this.gl, this.planeGeometry.position),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.normal),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.color),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.texCoord), // テクスチャ座標 @@@
    ];
    // IBO（多分オプショナル）
    // Geometry内でポリゴン（3角形）をつくるための指示（頂点を使いまわせる）
    // 反時計回りが表（法線側）
    this.planeIBO = WebGLUtility.createIBO(this.gl, this.planeGeometry.index);
  }

  /*****************************************
   * 4. Shader属性の情報（Location）取得
   * VBOと紐づけるため同数必要
  *****************************************/

  setupLocation() {
    const gl = this.gl;
    // Shader属性を取得
    this.attributeLocation = [
      gl.getAttribLocation(this.program, 'position'),
      gl.getAttribLocation(this.program, 'normal'),
      gl.getAttribLocation(this.program, 'color'),
      gl.getAttribLocation(this.program, 'texCoord'), // テクスチャ座標 @@@
    ];
    // 上記各VBOの一つの頂点属性が何個の値で構成されているか（ex. positionはx、y、zの3つ）
    this.attributeStride = [
      3,
      3,
      4,
      2, // ストライドは２ @@@
    ];

    // Uniform locationの取得
    /*****************************************
     * 5. Uniform Location変数取得
     * UniformはCPU（JS）から操作可能な変数を設定
    *****************************************/

    this.uniformLocation = {
      mvpMatrix: gl.getUniformLocation(this.program, 'mvpMatrix'),
      normalMatrix: gl.getUniformLocation(this.program, 'normalMatrix'),
      texture0: gl.getUniformLocation(this.program, 'texture0'),
      texture1: gl.getUniformLocation(this.program, 'texture1'),
      displacement: gl.getUniformLocation(this.program, 'displacement'),
      time: gl.getUniformLocation(this.program, 'time'), // uniform 変数のロケーション @@@
      // fitRatio: gl.getUniformLocation(this.program, 'fitRatio'),
    };
  }

  /**
   * レンダリングのためのセットアップを行う
   */
  setupRendering() {
    const gl = this.gl;

    /*****************************************
     * 6. 描画基本設定（設定済みのため確認のみ）
     * renderループの中でマイフレーム処理される
    *****************************************/

    // ビューポートを設定する
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // クリアする色と深度を設定する
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    // 色と深度をクリアする
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /**
   * 描画を開始する
   */
  start() {
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
    // 記述短縮用
    const gl = this.gl;
    const m4 = WebGLMath.Mat4;
    const v3 = WebGLMath.Vec3;

    // レンダリングのフラグの状態を見て、requestAnimationFrame を呼ぶか決める
    if (this.isRender === true) {
      requestAnimationFrame(this.render);
    }

    // 現在までの経過時間
    const currentTime = (Date.now() - this.startTime) * 0.001;

    /*****************************************
     * 生WebGLの処理（動きを適用）フェーズ
     * ・WebGLの初期化
     * ・attributeの指定
     * ・uniformの指定
     * ・テクスチャの指定
     * ・プログラムの指定
     * ・draw関数でレンダリング
     * https://note.com/kenji_special/n/n79bfbe02767c
    *****************************************/

    // レンダリングのセットアップ
    this.setupRendering();

    // モデル座標変換行列（ここでは特になにもモデル座標変換は掛けていない）
    /*****************************************
     * 7. モデル座標の生成（ ≒ アニメーション）
     * 行列を使ってmodel座標を生成し拡大縮小・移動などを行う
     * https://qiita.com/kazoo/items/3ca048540f25479062c7
     *****************************************/
   
    const m = m4.identity(); // 単位行列 初期状態（何もしない）などに使用 第6回30P

    // ビュー・プロジェクション座標変換行列
    /*****************************************
     * 7. ビュー・プロジェクション座標（カメラ、スクリーン投影）の生成
     * model座標と乗算し、mvp行列を生成
    *****************************************/

    const v = this.camera.update(); // 戻り値は行列
    const fovy   = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near   = 0.1
    const far    = 100.0;
    const p = m4.perspective(fovy, aspect, near, far);

    // 行列を乗算して MVP 行列を生成する（掛ける順序に注意）
    const vp = m4.multiply(p, v);
    const mvp = m4.multiply(vp, m);

    // モデル座標変換行列の、逆転置行列を生成する
    /*****************************************
     * 8. 法線座標の更新 第6回117P 暗記案件
    *****************************************/

    const normalMatrix = m4.transpose(m4.inverse(m));

    // フラグの状態に応じてテクスチャを０番ユニットにバインドする @@@
    /*****************************************
     * 9. テクスチャ適用
     * activeTexture、bindTextureは同時に使う数分用意
    *****************************************/

    // フラグの状態に応じてテクスチャを０（+index）番ユニットにバインドする @@@
    this.textures.forEach((texture, index) => {
      if (this.textureVisibility === true) {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      } else {
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    })

    // プログラムオブジェクトを選択しuniform変数を更新する
    /*****************************************
     * Uniformの更新
     * 使うShaderを指定、生成した行列をUniformに送り更新
    *****************************************/

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, mvp);
    gl.uniformMatrix4fv(this.uniformLocation.normalMatrix, false, normalMatrix);
    gl.uniform1i(this.uniformLocation.texture0, 0); // テクスチャユニットの番号を送る @@@
    gl.uniform1i(this.uniformLocation.texture1, 1);
    gl.uniform1i(this.uniformLocation.displacement, 2);
    gl.uniform1f(this.uniformLocation.time, currentTime); // 経過時間
    // gl.uniform2f(this.uniformLocation.time, this.fitRatio.x, this.fitRatio.y); // 画像fitのためのアスペクト
    // console.log(Math.sin(currentTime));
    // gl.uniform2fv(this.uniformLocation.resolution, this.resolution);
    // gl.uniform2fv(this.uniformLocation.imageResolution, this.imageResolution); // ここは固定値なのでshaderないattributeでもいいかも

    /*****************************************
     * 図形の描画
     * VBO（IBO）、Location etc.を設定、描画
    *****************************************/
    
    WebGLUtility.enableBuffer(gl, this.planeVBO, this.attributeLocation, this.attributeStride, this.planeIBO);
    gl.drawElements(gl.TRIANGLES, this.planeGeometry.index.length, gl.UNSIGNED_SHORT, 0);
  }
}

