
/** ===========================================================================
 * 複数のテクスチャの色を線形に補間することで、画像がスムーズに切り替わっている
 * ように見えるようなビジュアルを実現することができましたが……
 * ここでは、第三の画像を利用して、その画像の色を指標にしたトランジション（遷移）
 * に挑戦してみましょう。
 * トランジション用の素材を変更すれば、手軽に質感や外観を変更できます。
 * ========================================================================= */

const MAT = new matIV();
const QTN = new qtnIV();

window.addEventListener('DOMContentLoaded', () => {
  const webgl = new WebGLFrame();
  webgl.init('webgl-canvas');
  webgl.load()
  .then(() => {
    webgl.setup();
    webgl.debugSetting();
    webgl.render();
  });
}, false);

class WebGLFrame {
  constructor() {
    this.canvas    = null;
    this.gl        = null;
    this.running   = false;
    this.startingTime = 0;
    this.currentTime   = 0;
    this.render    = this.render.bind(this);

    this.camera    = new InteractionCamera();
    this.mMatrix   = MAT.identity(MAT.create());
    this.vMatrix   = MAT.identity(MAT.create());
    this.pMatrix   = MAT.identity(MAT.create());
    this.vpMatrix  = MAT.identity(MAT.create());
    this.mvpMatrix = MAT.identity(MAT.create());

    // テクスチャのブレンド係数 @@@
    this.blendingRatio = 1.0;

    this.resize = this.resize.bind(this);
    this.imageResolution = {x: 1024, y: 1024};

  }
  /**
   * WebGL を実行するための初期化処理を行う。
   * @param {HTMLCanvasElement|string} canvas - canvas への参照か canvas の id 属性名のいずれか
   */
  init(canvas) {
    if (canvas instanceof HTMLCanvasElement === true) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if (c instanceof HTMLCanvasElement === true) {
        this.canvas = c;
      }
    }
    if (this.canvas == null) {throw new Error('invalid argument');}
    this.gl = this.canvas.getContext('webgl');
    if (this.gl == null) {throw new Error('webgl not supported');}

    // リサイズイベント
    this.resize();
    window.addEventListener('resize', this.resize, false);
  }

  // リサイズ処理
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.fittingRatio = {
      x: Math.min((this.canvas.width / this.canvas.height) / (this.imageResolution.x / this.imageResolution.y), 1.0),
      y: Math.min((this.canvas.height / this.canvas.width) / (this.imageResolution.y / this.imageResolution.x), 1.0)
    }
  }

  load() {
    // ロード完了後に必要となるプロパティを初期化
    this.program     = null;
    this.attLocation = null;
    this.attStride   = null;
    this.uniLocation = null;
    this.uniType     = null;

    this.textures = null;
    this.effectMap = null;

    return new Promise((resolve) => {
      this.loadShader([
        './vs1.vert',
        './fs1.frag',
      ])
      .then((shaders) => {
        const gl = this.gl;
        const vs = this.createShader(shaders[0], gl.VERTEX_SHADER);
        const fs = this.createShader(shaders[1], gl.FRAGMENT_SHADER);
        this.program = this.createProgram(vs, fs);
        // attribute 変数関係
        this.attLocation = [
          gl.getAttribLocation(this.program, 'position'),
          gl.getAttribLocation(this.program, 'color'),
          gl.getAttribLocation(this.program, 'texCoord'),
        ];
        this.attStride = [
          3,
          4,
          2,
        ];
        // uniform 変数関係
        this.uniLocation = [
          gl.getUniformLocation(this.program, 'mvpMatrix'),
          gl.getUniformLocation(this.program, 'ratio'),
          gl.getUniformLocation(this.program, 'textureUnit1'),
          gl.getUniformLocation(this.program, 'textureUnit2'),
          gl.getUniformLocation(this.program, 'textureUnit3'),
          gl.getUniformLocation(this.program, 'fittingRatio'),
        ];
        this.uniType = [
          'uniformMatrix4fv',
          'uniform1f',
          'uniform1i',
          'uniform1i',
          'uniform1i',
          'uniform2fv',
        ];

        // 複数画像ロード
        const imgs = [
          './img/1.jpg',
          './img/2.jpg',
        ];
        let textures = [];
        textures = imgs.map(path => this.createTextureFromFile(path));
        return Promise.all(textures);

      //   // テクスチャ用の素材１をロード
      //   return this.createTextureFromFile('./sample1.jpg')
      // })
      // .then(texture => {
      //   // 直前でバインドするとして、いったんプロパティに入れておく
      //   this.texture1 = texture;
      //   // テクスチャ用の素材２をロード
      //   return this.createTextureFromFile('./sample2.jpg')
      // })
      // .then(texture => {
      //   // 直前でバインドするとして、いったんプロパティに入れておく
      //   this.texture2 = texture;
      //   // テクスチャ用の素材３をロード @@@
      //   return this.createTextureFromFile('./monochrome.jpg')
      })
      // .then((texture) => {
      //   // 直前でバインドするとして、いったんプロパティに入れておく
      //   this.texture3 = texture;

      //   // load メソッドを解決
      //   resolve();
      // });
      .then(textures => {
        this.textures = [...textures];
        return this.createTextureFromFile('./monochrome.jpg')
      })
      .then(effectMap => {
        this.effectMap = effectMap;
        resolve(); // resolve load func
      });
    });
  }
  /**
   * WebGL のレンダリングを開始する前のセットアップを行う。
   */
  setup() {
    // Plane Geometry
    this.position = [
      -1.0,  1.0,  0.0,
       1.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0,
    ];
    // Vertex Color
    this.color = [
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ];
    // UV
    this.texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];
    this.indices = [
      0, 1, 2, 2, 1, 3
    ];
    this.vbo = [
      this.createVbo(this.position),
      this.createVbo(this.color),
      this.createVbo(this.texCoord),
    ];
    // IBO
    this.ibo = this.createIbo(this.indices);

    // Axis Guid
    this.axisPosition = [
      0.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 1.0,
    ];
    this.axisColor = [
      0.5, 0.0, 0.0, 1.0,
      1.0, 0.2, 0.0, 1.0,
      0.0, 0.5, 0.0, 1.0,
      0.0, 1.0, 0.2, 1.0,
      0.0, 0.0, 0.5, 1.0,
      0.2, 0.0, 1.0, 1.0,
    ];
    this.axisTexCoord = [
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
    ];
    this.axisVbo = [
      this.createVbo(this.axisPosition),
      this.createVbo(this.axisColor),
      this.createVbo(this.axisTexCoord),
    ];

    this.gl.clearColor(0.4, 0.4, 0.4, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.running = true;
    this.startingTime = Date.now();
  }

  debugSetting() {
    // Esc キーで実行を止められるようにイベントを設定
    window.addEventListener('keydown', (evt) => {
      this.running = evt.key !== 'Escape';
    }, false);

    // マウス関連イベントの登録
    this.camera.update();
    this.canvas.addEventListener('mousedown', this.camera.startEvent, false);
    this.canvas.addEventListener('mousemove', this.camera.moveEvent, false);
    this.canvas.addEventListener('mouseup', this.camera.endEvent, false);
    this.canvas.addEventListener('wheel', this.camera.wheelEvent, false);

    // tweakpane で GUI を生成する
    const pane = new Tweakpane.Pane();
    pane.addBlade({
      view: 'slider',
      label: 'ratio',
      min: 0.0,
      max: 1.0,
      value: this.blendingRatio,
    }).on('change', v => this.blendingRatio = v.value);
  }

  render() {
    // const gl = this.gl; // Not to lost the context when getting back from a small research
    if (this.running === true) requestAnimationFrame(this.render);

    // Current Time
    this.currentTime = (Date.now() - this.startingTime) / 1000;

    // Renderer Reset
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Camera Config
    const cameraPosition    = [0.0, 0.0, 3.0];
    const centerPoint       = [0.0, 0.0, 0.0];
    const cameraUpDirection = [0.0, 1.0, 0.0];
    const fovy   = 60 * this.camera.scale;
    const aspect = this.canvas.width / this.canvas.height;
    const near   = 0.1;
    const far    = 10.0;

    // View Proj. Matrix
    this.vMatrix  = MAT.lookAt(cameraPosition, centerPoint, cameraUpDirection);
    this.pMatrix  = MAT.perspective(fovy, aspect, near, far);
    this.vpMatrix = MAT.multiply(this.pMatrix, this.vMatrix);
    this.camera.update();
    let quaternionMatrix = MAT.identity(MAT.create());
    quaternionMatrix = QTN.toMatIV(this.camera.qtn, quaternionMatrix);
    this.vpMatrix = MAT.multiply(this.vpMatrix, quaternionMatrix);
    // Model Matrix
    this.mMatrix = MAT.identity(this.mMatrix);
    this.mvpMatrix = MAT.multiply(this.vpMatrix, this.mMatrix);

    // Program Selection
    this.gl.useProgram(this.program);

    // // 0 番目のユニットを指定してテクスチャ１をバインド
    // this.gl.activeTexture(this.gl.TEXTURE0);
    // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture1);
    // // 1 番目のユニットを指定してテクスチャ２をバインド
    // this.gl.activeTexture(this.gl.TEXTURE1);
    // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture2);
    // // 2 番目のユニットを指定してテクスチャ３をバインド @@@
    // this.gl.activeTexture(this.gl.TEXTURE2);
    // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture3);

    // Texture Setup
    this.textures.forEach((texture, index) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + index);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    })
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.effectMap);

    // attribute と uniform を設定・更新し頂点をレンダリングする
    this.setAttribute(this.vbo, this.attLocation, this.attStride, this.ibo);
    this.setUniform([
      this.mvpMatrix,
      this.blendingRatio,
      0, // それぞれのテクスチャユニットを指定
      1, // それぞれのテクスチャユニットを指定
      2, // それぞれのテクスチャユニットを指定
      [this.fittingRatio.x, this.fittingRatio.y],
    ], this.uniLocation, this.uniType);
    this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

    // 以下は軸の描画 -------------------------------------------------------
    this.setAttribute(this.axisVbo, this.attLocation, this.attStride);
    this.setUniform([
      this.vpMatrix,
      this.blendingRatio,
      0,
      1,
      2,
    ], this.uniLocation, this.uniType);
    this.gl.drawArrays(this.gl.LINES, 0, this.axisPosition.length / 3);
  }

  // Utility Methods =========================================================

  /**
   * シェーダのソースコードを外部ファイルから取得する。
   * @param {Array.<string>} pathArray - シェーダを記述したファイルのパス（の配列）
   * @return {Promise}
   */
  loadShader(pathArray) {
    if (Array.isArray(pathArray) !== true) {
      throw new Error('invalid argument');
    }
    const promises = pathArray.map((path) => {
      return fetch(path).then((response) => {return response.text();})
    });
    return Promise.all(promises);
  }

  /**
   * シェーダオブジェクトを生成して返す。
   * コンパイルに失敗した場合は理由をアラートし null を返す。
   * @param {string} source - シェーダのソースコード文字列
   * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @return {WebGLShader} シェーダオブジェクト
   */
  createShader(source, type) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
  }

  /**
   * プログラムオブジェクトを生成して返す。
   * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
   * @param {WebGLShader} vs - 頂点シェーダオブジェクト
   * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
   * @return {WebGLProgram} プログラムオブジェクト
   */
  createProgram(vs, fs) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;
    } else {
      alert(gl.getProgramInfoLog(program));
      return null;
    }
  }

  /**
   * VBO を生成して返す。
   * @param {Array} data - 頂点属性データを格納した配列
   * @return {WebGLBuffer} VBO
   */
  createVbo(data) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }

  /**
   * IBO を生成して返す。
   * @param {Array} data - インデックスデータを格納した配列
   * @return {WebGLBuffer} IBO
   */
  createIbo(data) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  /**
   * IBO を生成して返す。(INT 拡張版)
   * @param {Array} data - インデックスデータを格納した配列
   * @return {WebGLBuffer} IBO
   */
  createIboInt(data) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    if (ext == null || ext.elementIndexUint == null) {
      throw new Error('element index Uint not supported');
    }
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  /**
   * 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する。
   * @param {string} source - ソースとなる画像のパス
   * @return {Promise}
   */
  createTextureFromFile(source) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    return new Promise((resolve) => {
      const gl = this.gl;
      const img = new Image();
      img.addEventListener('load', () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        resolve(tex);
      }, false);
      img.src = source;
    });
  }

  /**
   * フレームバッファを生成して返す。
   * @param {number} width - フレームバッファの幅
   * @param {number} height - フレームバッファの高さ
   * @return {object} 生成した各種オブジェクトはラップして返却する
   * @property {WebGLFramebuffer} framebuffer - フレームバッファ
   * @property {WebGLRenderbuffer} renderbuffer - 深度バッファとして設定したレンダーバッファ
   * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
   */
  createFramebuffer(width, height) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const depthRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
  }

  /**
   * フレームバッファを生成して返す。（フロートテクスチャ版）
   * @param {object} ext - getWebGLExtensions の戻り値
   * @param {number} width - フレームバッファの幅
   * @param {number} height - フレームバッファの高さ
   * @return {object} 生成した各種オブジェクトはラップして返却する
   * @property {WebGLFramebuffer} framebuffer - フレームバッファ
   * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
   */
  createFramebufferFloat(ext, width, height) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    if (ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)) {
      throw new Error('float texture not supported');
    }
    const flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return {framebuffer: frameBuffer, texture: fTexture};
  }

  /**
   * VBO を IBO をバインドし有効化する。
   * @param {Array} vbo - VBO を格納した配列
   * @param {Array} attL - attribute location を格納した配列
   * @param {Array} attS - attribute stride を格納した配列
   * @param {WebGLBuffer} ibo - IBO
   */
  setAttribute(vbo, attL, attS, ibo) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    vbo.forEach((v, index) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, v);
      gl.enableVertexAttribArray(attL[index]);
      gl.vertexAttribPointer(attL[index], attS[index], gl.FLOAT, false, 0, 0);
    });
    if (ibo != null) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }
  }

  /**
   * uniform 変数をまとめてシェーダに送る。
   * @param {Array} value - 各変数の値
   * @param {Array} uniL - uniform location を格納した配列
   * @param {Array} uniT - uniform 変数のタイプを格納した配列
   */
  setUniform(value, uniL, uniT) {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    value.forEach((v, index) => {
      const type = uniT[index];
      if (type.includes('Matrix') === true) {
        gl[type](uniL[index], false, v);
      } else {
        gl[type](uniL[index], v);
      }
    });
  }

  /**
   * 主要な WebGL の拡張機能を取得する。
   * @return {object} 取得した拡張機能
   * @property {object} elementIndexUint - Uint32 フォーマットを利用できるようにする
   * @property {object} textureFloat - フロートテクスチャを利用できるようにする
   * @property {object} textureHalfFloat - ハーフフロートテクスチャを利用できるようにする
   */
  getWebGLExtensions() {
    if (this.gl == null) {
      throw new Error('webgl not initialized');
    }
    const gl = this.gl;
    return {
      elementIndexUint: gl.getExtension('OES_element_index_uint'),
      textureFloat:   gl.getExtension('OES_texture_float'),
      textureHalfFloat: gl.getExtension('OES_texture_half_float')
    };
  }
}

/**
 * マウスでドラッグ操作を行うための簡易な実装例
 * @class
 */
class InteractionCamera {
  /**
   * @constructor
   */
  constructor() {
    this.qtn               = QTN.identity(QTN.create());
    this.dragging          = false;
    this.prevMouse         = [0, 0];
    this.rotationScale     = Math.min(window.innerWidth, window.innerHeight);
    this.rotation          = 0.0;
    this.rotateAxis        = [0.0, 0.0, 0.0];
    this.rotatePower       = 2.0;
    this.rotateAttenuation = 0.9;
    this.scale             = 1.25;
    this.scalePower        = 0.0;
    this.scaleAttenuation  = 0.8;
    this.scaleMin          = 0.25;
    this.scaleMax          = 2.0;
    this.startEvent        = this.startEvent.bind(this);
    this.moveEvent         = this.moveEvent.bind(this);
    this.endEvent          = this.endEvent.bind(this);
    this.wheelEvent        = this.wheelEvent.bind(this);
  }
  /**
   * mouse down event
   * @param {Event} eve - event object
   */
  startEvent(eve) {
    this.dragging = true;
    this.prevMouse = [eve.clientX, eve.clientY];
  }
  /**
   * mouse move event
   * @param {Event} eve - event object
   */
  moveEvent(eve) {
    if (this.dragging !== true) {return;}
    const x = this.prevMouse[0] - eve.clientX;
    const y = this.prevMouse[1] - eve.clientY;
    this.rotation = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
    this.rotateAxis[0] = y;
    this.rotateAxis[1] = x;
    this.prevMouse = [eve.clientX, eve.clientY];
  }
  /**
   * mouse up event
   */
  endEvent() {
    this.dragging = false;
  }
  /**
   * wheel event
   * @param {Event} eve - event object
   */
  wheelEvent(eve) {
    const w = eve.wheelDelta;
    const s = this.scaleMin * 0.1;
    if (w > 0) {
      this.scalePower = -s;
    } else if (w < 0) {
      this.scalePower = s;
    }
  }
  /**
   * quaternion update
   */
  update() {
    this.scalePower *= this.scaleAttenuation;
    this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.scale + this.scalePower));
    if (this.rotation === 0.0) {return;}
    this.rotation *= this.rotateAttenuation;
    const q = QTN.identity(QTN.create());
    QTN.rotate(this.rotation, this.rotateAxis, q);
    QTN.multiply(this.qtn, q, this.qtn);
  }
}

/** 

TODO 波打ってDissolve Trans

1. 複数画像をload 前のscript参照
2. Planeをつくる
2. js uniformでtextureを2枚送る（一旦ベタ）
2. 2枚の画像をmix fadeする
0. コード読む https://tympanus.net/Development/webGLImageTransitions/index.html
2. jsでaspect比率求め、Fragment Shaderに設定
2. Fragment SHader内にアス比加算
2. planeをcontain
2. fragment shader作る
----- 済
（1. JSからCamera & View削除）
2. やってみる https://zenn.dev/pentamania/articles/threejs-dissolve-effect-sample

3. 2枚の画像をDissolve
  https://github.com/ykob/glsl-dissolve/blob/master/src/glsl/dissolve.fs（cnoise使っている）
  https://codepen.io/timseverien/pen/BYJMRJ?editors=1000
  https://zenn.dev/pentamania/articles/threejs-dissolve-effect-sample（画像ノイズ使ってるので良さそう）
  ・マス目閾値を使ってmix
  ・上から下のグラデーション、閾値を使って乗算
  ・Opacity0-1を乗算
4. sin波 or 3Dモデル


*/