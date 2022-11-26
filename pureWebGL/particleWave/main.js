class WebGLApp {
  constructor() {
    this.canvas    = null;
    this.gl        = null;
    this.camera    = new InteractionCamera();
    this.running   = false;
    this.startTime = 0;
    this.currentTime   = 0;
    this.render    = this.render.bind(this);

    this.mMatrix   = Mat4.identity(Mat4.create());
    this.resize = this.resize.bind(this);
  }

  init(canvas) {
    if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if (c instanceof HTMLCanvasElement) {
        this.canvas = c;
      }
    }
    if (this.canvas == null) {throw new Error('invalid argument');}
    this.gl = this.canvas.getContext('webgl');
    if (this.gl == null) {throw new Error('webgl not supported');}

    // Resize
    this.resize();
    window.addEventListener('resize', this.resize, false);
  }

  // Resize
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ratioToFit = {
      x: Math.min(this.canvas.width / this.canvas.height, 1.0),
      y: Math.min(this.canvas.height / this.canvas.width, 1.0),
    }
  }
  
  load() {
    this.program     = null;
    this.attLocation = null;
    this.attStride   = null;
    this.uniLocation = null;
    this.uniType     = null;

    return new Promise(resolve => {
      this.loadShader(['./vs1.vert', './fs1.frag'])
      .then(shaders => {
        const vs = this.createShader(
          shaders[0],
          this.gl.VERTEX_SHADER
        );
        const fs = this.createShader(
          shaders[1],
          this.gl.FRAGMENT_SHADER
        );
        this.program = this.createProgram(vs, fs);
        // Attributes
        this.attLocation = [
          this.gl.getAttribLocation(this.program, 'positionA'),
          this.gl.getAttribLocation(this.program, 'positionB'),
        ];
        this.attStride = [3, 3];
        // Uniforms
        this.uniLocation = [
          this.gl.getUniformLocation(this.program, 'mvpMatrix'),
          this.gl.getUniformLocation(this.program, 'time'),
          this.gl.getUniformLocation(this.program, 'color'),
          this.gl.getUniformLocation(this.program, 'strength'),
        ];
        this.uniType = [
          'uniformMatrix4fv',
          'uniform1f',
          'uniform4fv',
          'uniform1f',
        ];
        resolve();
      });
    });
  }

  setup() {
    // Vertex Config
    let vertexCount = 97;
    this.positionsA = []; // Circle
    this.positionsB = []; // Square
    this.colors = [];
    this.geoRepeat = 25; // Repeat
    this.geoSize = 1;
    const EDGE_NUM = 4; // Square Edge Num

    // Adjustment to use the same particle number for A & B
    vertexCount = vertexCount % EDGE_NUM == 0 ? vertexCount : vertexCount + (EDGE_NUM - vertexCount % EDGE_NUM);

    // Coordinate A
    for (let i = 0; i < vertexCount; i += 1) {
      const rad = (Math.PI * 2) * (i / vertexCount);
      const x = Math.sin(rad);
      const y = Math.cos(rad);
      this.positionsA.push(x, y, 0);
    }

    // Coordinate B
    const PNUM_ON_EDGE = vertexCount / EDGE_NUM;
    const P_INTERVAL = (this.geoSize / PNUM_ON_EDGE) * (1 / this.geoSize);
    for (let i = 0; i < PNUM_ON_EDGE; i += 1) {
      this.positionsB.push(-0.5 + P_INTERVAL * i, 0.5, 0.0);
    }
    for (let i = 0; i < PNUM_ON_EDGE; i += 1) {
      this.positionsB.push(0.5, 0.5 - P_INTERVAL * i, 0.0);
    }
    for (let i = 0; i < PNUM_ON_EDGE; i += 1) {
      this.positionsB.push(0.5 - P_INTERVAL * i, -0.5, 0.0);
    }
    for (let i = 0; i < PNUM_ON_EDGE; i += 1) {
      this.positionsB.push(-0.5, -0.5 + P_INTERVAL * i, 0.0);
    }

    // Color
    for(let i = 0; i < this.geoRepeat; i += 1) {
      const tmpRgb = this.hslToRgb((360 / this.geoRepeat) * i, 100, 75);
      this.colors.push(tmpRgb.r, tmpRgb.g, tmpRgb.b, 1);
    }

    // VBO
    this.vbo = [
      this.createVbo(this.positionsA),
      this.createVbo(this.positionsB),
    ];

    // Render Config
    this.gl.clearColor(.1, .1, .1, 1);
    this.gl.clearDepth(1);

    this.gl.enable(this.gl.DEPTH_TEST);

    // this.gl.enable(this.gl.BLEND);
    // this.gl.blendEquation(this.gl.FUNC_ADD);
    // this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

    this.running = true;
    this.startTime = Date.now();
  }

  render() {
    if (this.running) requestAnimationFrame(this.render);
    this.currentTime = (Date.now() - this.startTime) / 1000; // Elapsed Time

    // Renderer Reset
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Program Select
    this.gl.useProgram(this.program);

    // Geometry Select
    this.setAttribute(this.vbo, this.attLocation, this.attStride);

    // Camera Config
    const cameraPosition    = [0.0, 0.0, 1.0];
    const centerPoint       = [0.0, 0.0, 0.0];
    const cameraUpDirection = [0.0, 1.0, 0.0];
    // const fovy   = 60 * this.camera.scale; // Angle
    // const aspect = this.canvas.width / this.canvas.height; // Aspect Ratio
    const near   = -5;
    const far    =  5;
    const left   = -1;
    const right  =  1;
    const top    =  1;
    const bottom = -1;

    // Projection & View Matrix
    this.vMatrix  = Mat4.lookAt(cameraPosition, centerPoint, cameraUpDirection);
    // this.pMatrix  = Mat4.perspective(fovy, aspect, near, far); // Perspective
    this.pMatrix  = Mat4.ortho(left, right, top, bottom, near, far); // Ortho
    this.vpMatrix = Mat4.multiply(this.pMatrix, this.vMatrix);
    // Camera Motion Update
    this.camera.update();
    let quaternionMatrix = Mat4.identity(Mat4.create());
    quaternionMatrix = Qtn4.toMatIV(this.camera.qtn, quaternionMatrix);
    this.vpMatrix = Mat4.multiply(this.vpMatrix, quaternionMatrix);

    // Model Matrix
    const COLOR_STRIDE = 4;
    for(let i = 0; i < this.geoRepeat; i += 1) {

      // Initialization
      this.mMatrix = Mat4.identity(this.mMatrix);

      // Rotation A
      const timeA = this.currentTime + (0.2 * i);
      this.mMatrix = Mat4.rotate(
        this.mMatrix,
        Math.cos(timeA / 3) * 3,
        new Float32Array([0.0, 1.0, 1.0]),
        this.mMatrix
      );

      // Mix Strength using "TimeA"
      const mixStrength = (Math.cos(timeA * .4) * .5) + .5;

      // Rotation B
      this.mMatrix = Mat4.rotate(
        this.mMatrix,
        Math.sin(this.currentTime * .25),
        new Float32Array([1.0, 1.0, 0.0]),
        this.mMatrix
      );

      // Copy
      const sizeScale = this.geoSize - (this.geoSize / this.geoRepeat * i);
      this.mMatrix = Mat4.scale(
        this.mMatrix,
        new Float32Array([
          sizeScale,
          sizeScale,
          sizeScale
        ]),
        this.mMatrix
      );

      // Aspect Tweak
      this.mvpMatrix = Mat4.multiply(this.vpMatrix, this.mMatrix);
      this.mvpMatrix = Mat4.scale(
        this.mvpMatrix,
        new Float32Array([
          this.ratioToFit.y * 3.5,
          this.ratioToFit.x * 3.5,
          1.0
        ]),
        this.mvpMatrix
      );

      // Uniform Transfer
      this.setUniform([
        this.mvpMatrix,
        this.currentTime,
        [
          this.colors[i * COLOR_STRIDE + 0],
          this.colors[i * COLOR_STRIDE + 1],
          this.colors[i * COLOR_STRIDE + 2],
          this.colors[i * COLOR_STRIDE + 3],
        ],
        mixStrength,
      ], this.uniLocation, this.uniType);
      this.gl.drawArrays(this.gl.POINTS, 0, this.positionsA.length / 3);
    }
  }

  /*************************************************
  Utilities
  *************************************************/

  loadShader(paths) {
    const promises = paths.map(path => {
      return fetch(path).then(response => {
        return response.text();
      })
    });
    return Promise.all(promises);
  }

  createShader(src, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      return shader;
    } else {
      alert(this.gl.getShaderInfoLog(shader));
      return null;
    }
  }

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

  createVbo(data) {
    const vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    return vbo;
  }

  setAttribute(vbo, attL, attS, ibo) {
    vbo.forEach((v, index) => {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, v);
      this.gl.enableVertexAttribArray(attL[index]);
      this.gl.vertexAttribPointer(attL[index], attS[index], this.gl.FLOAT, false, 0, 0);
    });
    if (ibo != null) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    }
  }

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

  hslToRgb(h, s, l) {
    const HUE_MAX = 360;
    const SATURATION_MAX = 100;
    const LIGHTNESS_MAX = 100;
    let r, g, b, max, min;

    const H = h;
    h = h % HUE_MAX;
    s = s / SATURATION_MAX;
    l = l / LIGHTNESS_MAX;

    if (l < 0.5) {
      max = l + l * s;
      min = l - l * s;
    } else {
      max = l + (1 - l) * s;
      min = l - (1 - l) * s;
    }

    const hp = HUE_MAX / 6;
    const q = h / hp;
    if (q <= 1) {
      r = max;
      g = (h / hp) * (max - min) + min;
      b = min;
    } else if (q <= 2) {
      r = ((hp * 2 - h) / hp) * (max - min) + min;
      g = max;
      b = min;
    } else if (q <= 3) {
      r = min;
      g = max;
      b = ((h - hp * 2) / hp) * (max - min) + min;
    } else if (q <= 4) {
      r = min;
      g = ((hp * 4 - h) / hp) * (max - min) + min;
      b = max;
    } else if (q <= 5) {
      r = ((h - hp * 4) / hp) * (max - min) + min;
      g = min;
      b = max;
    } else {
      r = max;
      g = min;
      b = ((HUE_MAX - h) / hp) * (max - min) + min;
    }

    return {
      r: parseFloat(r.toFixed(2)),
      g: parseFloat(g.toFixed(2)),
      b: parseFloat(b.toFixed(2))
    };
  };
}

/*************************************************
Math Classes
*************************************************/

class Mat4 {
  static create() {
    return new Float32Array(16);
  };

  static identity(dest) {
    dest[0]  = 1; dest[1]  = 0; dest[2]  = 0; dest[3]  = 0;
    dest[4]  = 0; dest[5]  = 1; dest[6]  = 0; dest[7]  = 0;
    dest[8]  = 0; dest[9]  = 0; dest[10] = 1; dest[11] = 0;
    dest[12] = 0; dest[13] = 0; dest[14] = 0; dest[15] = 1;
    return dest;
  };

  static multiply(mat1, mat2, dest) {
    if (dest == null) {dest = this.create();}
    var a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
      e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
      i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
      m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
      A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
      E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
      I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
      M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
    dest[0] = A * a + B * e + C * i + D * m;
    dest[1] = A * b + B * f + C * j + D * n;
    dest[2] = A * c + B * g + C * k + D * o;
    dest[3] = A * d + B * h + C * l + D * p;
    dest[4] = E * a + F * e + G * i + H * m;
    dest[5] = E * b + F * f + G * j + H * n;
    dest[6] = E * c + F * g + G * k + H * o;
    dest[7] = E * d + F * h + G * l + H * p;
    dest[8] = I * a + J * e + K * i + L * m;
    dest[9] = I * b + J * f + K * j + L * n;
    dest[10] = I * c + J * g + K * k + L * o;
    dest[11] = I * d + J * h + K * l + L * p;
    dest[12] = M * a + N * e + O * i + P * m;
    dest[13] = M * b + N * f + O * j + P * n;
    dest[14] = M * c + N * g + O * k + P * o;
    dest[15] = M * d + N * h + O * l + P * p;
    return dest;
  };

  static scale(mat, vec, dest) {
    dest[0]  = mat[0]  * vec[0];
    dest[1]  = mat[1]  * vec[0];
    dest[2]  = mat[2]  * vec[0];
    dest[3]  = mat[3]  * vec[0];
    dest[4]  = mat[4]  * vec[1];
    dest[5]  = mat[5]  * vec[1];
    dest[6]  = mat[6]  * vec[1];
    dest[7]  = mat[7]  * vec[1];
    dest[8]  = mat[8]  * vec[2];
    dest[9]  = mat[9]  * vec[2];
    dest[10] = mat[10] * vec[2];
    dest[11] = mat[11] * vec[2];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
  };

  static translate(mat, vec, dest) {
    dest[0] = mat[0]; dest[1] = mat[1]; dest[2]  = mat[2];  dest[3]  = mat[3];
    dest[4] = mat[4]; dest[5] = mat[5]; dest[6]  = mat[6];  dest[7]  = mat[7];
    dest[8] = mat[8]; dest[9] = mat[9]; dest[10] = mat[10]; dest[11] = mat[11];
    dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8]  * vec[2] + mat[12];
    dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9]  * vec[2] + mat[13];
    dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
    dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
    return dest;
  };

  static rotate(mat, angle, axis, dest) {
    var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (!sq) {return null;}
    var a = axis[0], b = axis[1], c = axis[2];
    if (sq != 1) {sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
    var d = Math.sin(angle), e = Math.cos(angle), f = 1 - e,
      g = mat[0],  h = mat[1], i = mat[2],  j = mat[3],
      k = mat[4],  l = mat[5], m = mat[6],  n = mat[7],
      o = mat[8],  p = mat[9], q = mat[10], r = mat[11],
      s = a * a * f + e,
      t = b * a * f + c * d,
      u = c * a * f - b * d,
      v = a * b * f - c * d,
      w = b * b * f + e,
      x = c * b * f + a * d,
      y = a * c * f + b * d,
      z = b * c * f - a * d,
      A = c * c * f + e;
    if (angle) {
      if (mat != dest) {
        dest[12] = mat[12]; dest[13] = mat[13];
        dest[14] = mat[14]; dest[15] = mat[15];
      }
    } else {
      dest = mat;
    }
    dest[0]  = g * s + k * t + o * u;
    dest[1]  = h * s + l * t + p * u;
    dest[2]  = i * s + m * t + q * u;
    dest[3]  = j * s + n * t + r * u;
    dest[4]  = g * v + k * w + o * x;
    dest[5]  = h * v + l * w + p * x;
    dest[6]  = i * v + m * w + q * x;
    dest[7]  = j * v + n * w + r * x;
    dest[8]  = g * y + k * z + o * A;
    dest[9]  = h * y + l * z + p * A;
    dest[10] = i * y + m * z + q * A;
    dest[11] = j * y + n * z + r * A;
    return dest;
  };

  static lookAt(eye, center, up, dest) {
    if (dest == null) {dest = this.create();}
    var eyeX  = eye[0],  eyeY  = eye[1],  eyeZ  = eye[2],
      upX   = up[0],   upY   = up[1],   upZ   = up[2],
      centerX = center[0], centerY = center[1], centerZ = center[2];
    if (eyeX == centerX && eyeY == centerY && eyeZ == centerZ) {return this.identity(dest);}
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
    z0 = eyeX - center[0]; z1 = eyeY - center[1]; z2 = eyeZ - center[2];
    l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= l; z1 *= l; z2 *= l;
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!l) {
      x0 = 0; x1 = 0; x2 = 0;
    } else {
      l = 1 / l;
      x0 *= l; x1 *= l; x2 *= l;
    }
    y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
    l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!l) {
      y0 = 0; y1 = 0; y2 = 0;
    } else {
      l = 1 / l;
      y0 *= l; y1 *= l; y2 *= l;
    }
    dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
    dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
    dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
    dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    dest[15] = 1;
    return dest;
  };

  static perspective(fovy, aspect, near, far, dest) {
    if (dest == null) {dest = this.create();}
    var r = 1 / Math.tan(fovy * Math.PI / 360);
    var d = far - near;
    dest[0]  = r / aspect;
    dest[1]  = 0;
    dest[2]  = 0;
    dest[3]  = 0;
    dest[4]  = 0;
    dest[5]  = r;
    dest[6]  = 0;
    dest[7]  = 0;
    dest[8]  = 0;
    dest[9]  = 0;
    dest[10] = -(far + near) / d;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / d;
    dest[15] = 0;
    return dest;
  };

  static ortho(left, right, top, bottom, near, far, dest) {
    if (dest == null) {dest = this.create();}
    var h = (right - left);
    var v = (top - bottom);
    var d = (far - near);
    dest[0]  = 2 / h;
    dest[1]  = 0;
    dest[2]  = 0;
    dest[3]  = 0;
    dest[4]  = 0;
    dest[5]  = 2 / v;
    dest[6]  = 0;
    dest[7]  = 0;
    dest[8]  = 0;
    dest[9]  = 0;
    dest[10] = -2 / d;
    dest[11] = 0;
    dest[12] = -(left + right) / h;
    dest[13] = -(top + bottom) / v;
    dest[14] = -(far + near) / d;
    dest[15] = 1;
    return dest;
  };

  static transpose(mat, dest) {
    if (dest == null) {dest = this.create();}
    dest[0]  = mat[0];  dest[1]  = mat[4];
    dest[2]  = mat[8];  dest[3]  = mat[12];
    dest[4]  = mat[1];  dest[5]  = mat[5];
    dest[6]  = mat[9];  dest[7]  = mat[13];
    dest[8]  = mat[2];  dest[9]  = mat[6];
    dest[10] = mat[10]; dest[11] = mat[14];
    dest[12] = mat[3];  dest[13] = mat[7];
    dest[14] = mat[11]; dest[15] = mat[15];
    return dest;
  };

  static inverse(mat, dest) {
    if (dest == null) {dest = this.create();}
    var a = mat[0],  b = mat[1],  c = mat[2],  d = mat[3],
      e = mat[4],  f = mat[5],  g = mat[6],  h = mat[7],
      i = mat[8],  j = mat[9],  k = mat[10], l = mat[11],
      m = mat[12], n = mat[13], o = mat[14], p = mat[15],
      q = a * f - b * e, r = a * g - c * e,
      s = a * h - d * e, t = b * g - c * f,
      u = b * h - d * f, v = c * h - d * g,
      w = i * n - j * m, x = i * o - k * m,
      y = i * p - l * m, z = j * o - k * n,
      A = j * p - l * n, B = k * p - l * o,
      ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
    dest[0]  = ( f * B - g * A + h * z) * ivd;
    dest[1]  = (-b * B + c * A - d * z) * ivd;
    dest[2]  = ( n * v - o * u + p * t) * ivd;
    dest[3]  = (-j * v + k * u - l * t) * ivd;
    dest[4]  = (-e * B + g * y - h * x) * ivd;
    dest[5]  = ( a * B - c * y + d * x) * ivd;
    dest[6]  = (-m * v + o * s - p * r) * ivd;
    dest[7]  = ( i * v - k * s + l * r) * ivd;
    dest[8]  = ( e * A - f * y + h * w) * ivd;
    dest[9]  = (-a * A + b * y - d * w) * ivd;
    dest[10] = ( m * u - n * s + p * q) * ivd;
    dest[11] = (-i * u + j * s - l * q) * ivd;
    dest[12] = (-e * z + f * x - g * w) * ivd;
    dest[13] = ( a * z - b * x + c * w) * ivd;
    dest[14] = (-m * t + n * r - o * q) * ivd;
    dest[15] = ( i * t - j * r + k * q) * ivd;
    return dest;
  };
}

class Qtn4 {
  static create () {
    return new Float32Array(4);
  };
  static identity(dest) {
    dest[0] = 0; dest[1] = 0; dest[2] = 0; dest[3] = 1;
    return dest;
  };
  static inverse(qtn, dest) {
    if (dest == null) {dest = this.create();}
    dest[0] = -qtn[0];
    dest[1] = -qtn[1];
    dest[2] = -qtn[2];
    dest[3] =  qtn[3];
    return dest;
  };
  static normalize(dest) {
    var x = dest[0], y = dest[1], z = dest[2], w = dest[3];
    var l = Math.sqrt(x * x + y * y + z * z + w * w);
    if (l === 0) {
      dest[0] = 0;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
    } else {
      l = 1 / l;
      dest[0] = x * l;
      dest[1] = y * l;
      dest[2] = z * l;
      dest[3] = w * l;
    }
    return dest;
  };
  static multiply(qtn1, qtn2, dest) {
    if (dest == null) {dest = this.create();}
    var ax = qtn1[0], ay = qtn1[1], az = qtn1[2], aw = qtn1[3];
    var bx = qtn2[0], by = qtn2[1], bz = qtn2[2], bw = qtn2[3];
    dest[0] = ax * bw + aw * bx + ay * bz - az * by;
    dest[1] = ay * bw + aw * by + az * bx - ax * bz;
    dest[2] = az * bw + aw * bz + ax * by - ay * bx;
    dest[3] = aw * bw - ax * bx - ay * by - az * bz;
    return dest;
  };
  static rotate(angle, axis, dest) {
    var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (!sq) {return null;}
    var a = axis[0], b = axis[1], c = axis[2];
    if (sq != 1) {sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
    var s = Math.sin(angle * 0.5);
    dest[0] = a * s;
    dest[1] = b * s;
    dest[2] = c * s;
    dest[3] = Math.cos(angle * 0.5);
    return dest;
  };
  static toVecIII(vec, qtn, dest) {
    if (dest == null) {dest = this.create();}
    var qp = this.create();
    var qq = this.create();
    var qr = this.create();
    this.inverse(qtn, qr);
    qp[0] = vec[0];
    qp[1] = vec[1];
    qp[2] = vec[2];
    this.multiply(qr, qp, qq);
    this.multiply(qq, qtn, qr);
    dest[0] = qr[0];
    dest[1] = qr[1];
    dest[2] = qr[2];
    return dest;
  };
  static toMatIV(qtn, dest) {
    var x = qtn[0], y = qtn[1], z = qtn[2], w = qtn[3];
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;
    dest[0]  = 1 - (yy + zz);
    dest[1]  = xy - wz;
    dest[2]  = xz + wy;
    dest[3]  = 0;
    dest[4]  = xy + wz;
    dest[5]  = 1 - (xx + zz);
    dest[6]  = yz - wx;
    dest[7]  = 0;
    dest[8]  = xz - wy;
    dest[9]  = yz + wx;
    dest[10] = 1 - (xx + yy);
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  };
  static slerp(qtn1, qtn2, time, dest) {
    var ht = qtn1[0] * qtn2[0] + qtn1[1] * qtn2[1] + qtn1[2] * qtn2[2] + qtn1[3] * qtn2[3];
    var hs = 1.0 - ht * ht;
    if (hs <= 0.0) {
      dest[0] = qtn1[0];
      dest[1] = qtn1[1];
      dest[2] = qtn1[2];
      dest[3] = qtn1[3];
    } else {
      hs = Math.sqrt(hs);
      if (Math.abs(hs) < 0.0001) {
        dest[0] = (qtn1[0] * 0.5 + qtn2[0] * 0.5);
        dest[1] = (qtn1[1] * 0.5 + qtn2[1] * 0.5);
        dest[2] = (qtn1[2] * 0.5 + qtn2[2] * 0.5);
        dest[3] = (qtn1[3] * 0.5 + qtn2[3] * 0.5);
      } else {
        var ph = Math.acos(ht);
        var pt = ph * time;
        var t0 = Math.sin(ph - pt) / hs;
        var t1 = Math.sin(pt) / hs;
        dest[0] = qtn1[0] * t0 + qtn2[0] * t1;
        dest[1] = qtn1[1] * t0 + qtn2[1] * t1;
        dest[2] = qtn1[2] * t0 + qtn2[2] * t1;
        dest[3] = qtn1[3] * t0 + qtn2[3] * t1;
      }
    }
    return dest;
  };
}

/*************************************************
Other Classes
*************************************************/

class InteractionCamera {
  constructor() {
    this.qtn               = Qtn4.identity(Qtn4.create());
    this.dragging          = false;
    this.prevMouse         = [0, 0];
    this.rotationScale     = Math.min(window.innerWidth, window.innerHeight);
    this.rotation          = 0.0;
    this.rotateAxis        = [0.0, 0.0, 0.0];
    this.rotatePower       = 2.0;
    this.rotateAttenuation = 0.9;
    this.scale             = 1.5;
    this.scalePower        = 0.0;
    this.scaleAttenuation  = 0.8;
    this.scaleMin          = 0.25;
    this.scaleMax          = 2.0;
    this.startEvent        = this.startEvent.bind(this);
    this.moveEvent         = this.moveEvent.bind(this);
    this.endEvent          = this.endEvent.bind(this);
    this.wheelEvent        = this.wheelEvent.bind(this);
  }
  startEvent(eve) {
    this.dragging = true;
    this.prevMouse = [eve.clientX, eve.clientY];
  }
  moveEvent(eve) {
    if (this.dragging !== true) {return;}
    const x = this.prevMouse[0] - eve.clientX;
    const y = this.prevMouse[1] - eve.clientY;
    this.rotation = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
    this.rotateAxis[0] = y;
    this.rotateAxis[1] = x;
    this.prevMouse = [eve.clientX, eve.clientY];
  }
  endEvent() {
    this.dragging = false;
  }
  wheelEvent(eve) {
    const w = eve.wheelDelta;
    const s = this.scaleMin * 0.1;
    if (w > 0) {
      this.scalePower = -s;
    } else if (w < 0) {
      this.scalePower = s;
    }
  }
  update() {
    this.scalePower *= this.scaleAttenuation;
    this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.scale + this.scalePower));
    if (this.rotation === 0.0) {return;}
    this.rotation *= this.rotateAttenuation;
    const q = Qtn4.identity(Qtn4.create());
    Qtn4.rotate(this.rotation, this.rotateAxis, q);
    Qtn4.multiply(this.qtn, q, this.qtn);
  }
}

/*************************************************
Initialization
*************************************************/

window.addEventListener('DOMContentLoaded', () => {
  const webgl = new WebGLApp();
  webgl.init('webgl-canvas');
  webgl.load()
  .then(() => {
    webgl.setup();
    webgl.render();
  });
})
