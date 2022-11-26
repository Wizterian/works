window.addEventListener('DOMContentLoaded', () => {
  const webgl = new App();
  webgl.init('webgl-canvas');
  webgl.load().then(() => {
    webgl.setup();
    webgl.setupListener();
    webgl.render();
  })
}, false);

class App { 
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.beginTime = 0;
    this.currentTime   = 0;
    this.currentY = 0;
    this.render = this.render.bind(this);
  }
  // Canvas & WebGL Context Preparation
  init(canvas) {
    if (canvas instanceof HTMLCanvasElement === true) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if (c instanceof HTMLCanvasElement === true) this.canvas = c;
    }
    if (this.canvas == null) {throw new Error('invalid argument');}
    this.gl = this.canvas.getContext('webgl');
    if (this.gl == null) {throw new Error('webgl not supported');}
  }

  // Shader Preparation
  load() {
    return new Promise(resolve => {
      this.loadShader(['./vs1.vert', './fs1.frag'])
      .then(shaders => {
        // Shader Program
        const vs = this.createShader(shaders[0], this.gl.VERTEX_SHADER);
        const fs = this.createShader(shaders[1], this.gl.FRAGMENT_SHADER);
        this.program = this.createProgram(vs, fs);
        console.log('this.program: ', this.program);
        // Attributes & Strides Location Setting
        this.attLocation = [
          this.gl.getAttribLocation(this.program, 'position'),
          this.gl.getAttribLocation(this.program, 'color'),
          this.gl.getAttribLocation(this.program, 'size'),
          this.gl.getAttribLocation(this.program, 'random'),
          this.gl.getAttribLocation(this.program, 'direction')
        ];
        this.attStride = [3, 4, 1, 1, 1];
        // Uniforms & Types Location Setting
        this.uniLocation = [
          this.gl.getUniformLocation(this.program, 'globalColor'),
          this.gl.getUniformLocation(this.program, 'mouse'),
          this.gl.getUniformLocation(this.program, 'resolution'),
          this.gl.getUniformLocation(this.program, 'time')
        ];
        this.uniType = [
          'uniform4fv',
          'uniform2fv',
          'uniform2fv',
          'uniform1f'
        ];
        resolve();
      })
    });
  }

  setup() {
    // Attributes Values
    this.position = [];
    this.color = [];
    this.size = [];
    this.random = [];
    this.direction = [];

    const VERTEX_COUNT = 20000;
    const VERTEX_SIZE_SCALE = 10;
    for (let i = 0; i <= VERTEX_COUNT; i += 1) {
      const x = this.rdm() * 2 - 1;
      const y = this.rdm() * 2 - 1;
      this.position.push(x, y, 0);
      this.color.push( // r10: g7: b2
        this.rdm() * .4 + .6,
        this.rdm() * .3 + .4,
        this.rdm() * .1 + .1,
        this.rdm(0.95, 0.3)
      );
      this.size.push(this.rdm(1, 0.1) * VERTEX_SIZE_SCALE);
      this.random.push(this.rdm(1, 0.1));
      this.direction.push(this.rdm(1, 0) > 0.5 ? 1 : -1);
    }

    // VBO（for Attributes）
    this.vbo = [
      this.createVbo(this.position),
      this.createVbo(this.color),
      this.createVbo(this.size),
      this.createVbo(this.random),
      this.createVbo(this.direction)
    ];

    // Default Clear Color for BG https://wgld.org/d/webgl/w007.html
    this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
  
    // Blending (Transparency)
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(
      this.gl.SRC_ALPHA,           // SRC_RGB
      this.gl.ONE_MINUS_SRC_ALPHA, // DST_RGB
      this.gl.ONE,                 // SRC_A
      this.gl.ONE                  // DST_A
    );
    this.gl.blendEquation(this.gl.FUNC_ADD);

    this.beginTime = Date.now();
  }

  setupListener() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentMousePosX = 0;
    this.currentMousePosY = 0;

    if ('ontouchstart' in window) { // sp
      this.gl.canvas.addEventListener('touchstart', this.getMouseCoord, false);
      this.gl.canvas.addEventListener('touchmove', this.getMouseCoord, false);
    } else {
      this.gl.canvas.addEventListener('mousemove', e => {
        this.getMouseCoord(e);
        // this.getParticleCoord(e);
      }, false);
    }
  }

  render() {
    requestAnimationFrame(this.render);
    this.currentTime = (Date.now() - this.beginTime) / 1000;

    // Easing
    const easingStrength = 0.075;
    this.currentMousePosX += (this.mouseX - this.currentMousePosX) * easingStrength;
    this.currentMousePosY += (this.mouseY - this.currentMousePosY) * easingStrength;

    // Renderer Initialization
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); // Renderer Output Size
    this.gl.clear(this.gl.COLOR_BUFFER_BIT); // BG Clear with ClearColor

    // Shader Program Select
    this.gl.useProgram(this.program); // Shader Program Select
  
    // Shader Attr & Uniform Transfer
    this.setAttribute(this.vbo, this.attLocation, this.attStride); // All Attributes
    this.setUniform([
      [1.0, 1.0, 1.0, 1.0], // globalColor
      [this.currentMousePosX, this.currentMousePosY], // mouse
      [window.innerWidth, window.innerHeight], // resolution
      [this.currentTime], // time
    ], this.uniLocation, this.uniType); // Uniform Formatting Info

    // Draw ('drawArrays' func doesn't need IBO, but 'drawElements' does)
    this.gl.drawArrays(this.gl.POINTS, 0, this.position.length / 3);
  }

  /************************************************************
  Utilities
  ************************************************************/

  loadShader(shaderPaths) {
    if (!Array.isArray(shaderPaths)) {
      throw new Error('invalid argument');
    }
    // 'map' function can use 'return' unlike 'forEach'
    const promises = shaderPaths.map(path => {
      return fetch(path).then(response => response.text())
    })
    return Promise.all(promises);
  }
  // Shader Compilation
  createShader(source, type) {
    const shader = this.gl.createShader(type); // Type Verification (Vertex or Fragment)
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      return shader;
    } else {
      alert(this.gl.getShaderInfoLog(shader));
      return null;
    }
  }
  // Shader Program Generation
  createProgram(vs, fs) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      this.gl.useProgram(program);
      return program;
    } else {
      alert(this.gl.getProgramInfoLog(program));
      return null;
    }
  }
  // VBO Generation
  createVbo(data) {
    const vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo); // Buffer Bind
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW); // Data Transfer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null); // Bind Reset
    return vbo;
  }
  // Buffer Activation
  setAttribute(vbo, attL, attS, ibo) {
    vbo.forEach((v, index) => {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, v);
      this.gl.enableVertexAttribArray(attL[index]);
      this.gl.vertexAttribPointer(attL[index], attS[index], this.gl.FLOAT, false, 0, 0);
    });
    if (ibo != null) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
  }
  // Uniform Transfer
  setUniform(value, uniL, uniT) {
    value.forEach((v, index) => {
      const type = uniT[index];
      if (type.includes('Matrix') === true) {
        this.gl[type](uniL[index], false, v);
      } else {
        this.gl[type](uniL[index], v);
      }
    });
  }
  // Random
  rdm(max = 1, min = 0) {
    return Math.random() * (max - min) + min;
  }
  // getMouseCoord
  getMouseCoord = e => {
    let x, y;
    if (e.changedTouches && e.changedTouches.length) { // sp
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    const width  = window.innerWidth;
    const height = window.innerHeight;
    x = (x - width / 2.0) / (width / 2.0);
    y = (y - height / 2.0) / (height / 2.0);
    this.mouseX = x;
    this.mouseY = -y;
  }
  // getParticleCoord = e => {
  //   for(let i = 0; i < this.position.length; i += 3) {
  //     if(i === 0){
  //       const distance = Math.hypot(
  //         this.position[i] - this.mouseX, // x
  //         this.position[i + 1] - this.mouseY // y
  //       );

  //       if (distance < .2) {
  //         // particleを指定する一意の何かが必要 uniformは一つ、
  //         GSAP.to(xxxx, 0.4, {
  //           size: 3.0,
  //           ease: Power2.easeOut
  //         });
  //       } else {
  //         // particleを指定する一意の何かが必要
  //         GSAP.to(xxxx, 0.4, {
  //           size: 1.0,
  //           ease: Power2.easeOut
  //         });
  //       }
  //     }
  //   }
  // }
}
