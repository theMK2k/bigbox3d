/**
 * BIG BOX 3D v1.5.0
 * ©2023 Jörg "MK2k" Sonntag
 */

// #region Options
/* 
  ###################
  ##    OPTIONS    ##
  ###################
  
  IMPORTANT: don't touch these
  
  They will be overwritten by:
  - the query string parameters with the same name
  - bigbox3d.config.json (if bigbox3d.php is used)
  - config Object defined in bigbox3d.html

  whatever comes first.
*/
const opts = {
  // Options available as URL parameters
  name: "template-", // the base name of the image files, e.g. "?name=Ultimate%20DOOM-" if you have files named "Ultimate DOOM-front.jpg", "Ultimate DOOM-back.jpg" etc.

  // Options available as URL parameters as well as bigbox3d.config.json (if you use bigbox3d.php) or bigbox3d.html's config section
  path: null, // base path to image files (default: "", e.g. "/bigbox3d/img/")
  ext: "jpg", // the file extension of the box texture files (default: "jpg", e.g. "png" if you use .png files)
  bg: "000000", // the static background color, IMPORTANT: please always use 6 hex characters! (default: "000000", e.g. "ffffff" if you want a white background)
  bgvignette: true, // use a vignette effect for the background (default: true)
  bgpattern: true, // use a pattern effect for the background (default: true)
  bgext: null, // the file extension of the background file (provide this if you have a background image file with a different extension than the texture files of the box), e.g.
  // "?bgext=gif" if you have .gif background file
  // "?bgext=mp4" if you have a video file (for videos currently only mp4 is supported)
  bginterval: 10, // the interval in seconds to change the background image (applies if you have multiple background images)

  // Options only available with bigbox3d.config.json (if you use bigbox3d.php) or bigbox3d.html's config section
  host: "", // the host of your images, typically the same host, bigbox3d.html resides at (default: "", e.g. "https://example.com")
  extlink: "https://github.com/theMK2k/bigbox3d", // an external link to be displayed in the bottom left corner
  extlink_innerhtml: "scanned by MK2k, presented with <b>Big Box 3D</b>", // the innerHTML of the external link,
  rotation_speed: 20, // the rotation speed of the box when mouse-dragged (default: 20, range: 1-100)
  rotation_amortization: 0.91, // the amortization of the rotation speed when mouse released (default: 0.91, range: 0.1-1.0)
  rotation_initial_x: 0.15, // initial rotation on the x-axis (default: 0.15, range: 0.0-1.0)
  rotation_initial_y: -0.15, // initial rotation on the y-axis (default: -0.15, range: 0.0-1.0)
};
// #endregion Options

// #region Variables and Enums
/* 
  ###############################
  ##    VARIABLES AND ENUMS    ##
  ###############################
*/
let basePath = "";

const bgimgData = {
  cache: [], // stores virtual URLs of fetched images for each bgNum, e.g. 0: "blob:https://example.com/4a1769aa-d9cb-4a05-a540-51065bccce1c"
  currentBgNum: 0,
  maxBgNum: -1,
  bgChangeInterval: null,
};

let gl;

const tex_front = 0;
const tex_back = 1;
const tex_top = 2;
const tex_bottom = 3;
const tex_right = 4;
const tex_left = 5;

let extAnisotropic = null;

const enmFaces = {
  front: 0,
  back: 1,
  top: 2,
  bottom: 3,
  right: 4,
  left: 5,
};

const dimensions = {
  width: 1,
  height: 1,
  depth: 1,
};

let zoom = 1.4;

let dimensionsCalculated = false;

let shaderProgram;

let allTexturesLoaded = false;
const texturen = new Array();

let allLoaded = false;

let mvMatrix = glMatrix.mat4.create();
const mvMatrixStack = [];
const pMatrix = glMatrix.mat4.create();

let vertBuffer = null;
let coordBuffer = null;
let IndexBuffer = null;

let xRot = 0;
let yRot = 0;
let zRot = 0;

let lastTime = 0;

let THETA = 0;
let PHI = 0;
// #endregion Variables and Enums

// #region Helper Functions
/*
  ############################
  ##    HELPER FUNCTIONS    ##
  ############################
*/
function isNumeric(str) {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return null;
}

function hexToRgb(hex) {
  const matches = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  const rgb = matches
    ? {
        r: parseInt(matches[1], 16),
        g: parseInt(matches[2], 16),
        b: parseInt(matches[3], 16),
      }
    : null;

  logger.log("hexToRgb result:", rgb);

  return rgb;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}
// #endregion Helper Functions

// #region Logger
/*
  ##################
  ##    LOGGER    ##
  ##################

  Our own logging implementation with loglevel definition
*/
const enmLogLevels = {
  TRACE: 0,
  DEBUG: 1,
  LOG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
};

const logger = {
  logLevel: enmLogLevels.WARN,
  trace: function (...data) {
    if (this.logLevel > enmLogLevels.TRACE) {
      return;
    }

    console.trace("bigbox3d", data);
  },
  debug: function (...data) {
    if (this.logLevel > enmLogLevels.DEBUG) {
      return;
    }

    console.debug("bigbox3d", data);
  },
  log: function (...data) {
    if (this.logLevel > enmLogLevels.LOG) {
      return;
    }

    console.log("bigbox3d", data);
  },
  log: function (...data) {
    if (this.logLevel > enmLogLevels.INFO) {
      return;
    }

    console.info("bigbox3d", data);
  },
  warn: function (...data) {
    if (this.logLevel > enmLogLevels.WARN) {
      return;
    }

    console.warn("bigbox3d", data);
  },
  error: function (...data) {
    if (this.logLevel > enmLogLevels.ERROR) {
      return;
    }

    console.error("bigbox3d", data);
  },
};

const storedLogLevel = localStorage.getItem("logLevel");
if (isNumeric(storedLogLevel)) {
  logger.logLevel = parseInt(storedLogLevel);
} else {
  logger.logLevel = enmLogLevels.WARN;
}

function getLogLevel(level) {
  let result = null;
  Object.keys(enmLogLevels).forEach((key) => {
    if (enmLogLevels[key] === level) {
      result = key;
    }
  });
  return result;
}

console.info("bigbox3d", "logLevel is", getLogLevel(logger.logLevel));
console.info(
  "bigbox3d",
  "you can set another level by storing logLevel as Integer in localStorage"
);

// Logger Tests - not needed in production
// logger.trace('trace this', { test: 'test' });
// logger.debug('debug this', { test: 'test' });
// logger.log('log this', { test: 'test' });
// logger.warn('warn this', { test: 'test' });
// logger.error('error this', { test: 'test' });

// #endregion Logger

// #region WebGL
/*
  #################
  ##    WEBGL    ##
  #################
*/
function calculateDimensions() {
  if (dimensionsCalculated) {
    return;
  }

  logger.log("texturen:", texturen);

  // const width_absolute = image_sources[tex_front].width + image_sources[tex_back].width + image_sources[tex_top].width + image_sources[tex_bottom].width;
  // const width_absolute = texturen[enmFaces.front].image.width + texturen[enmFaces.back].image.width + texturen[enmFaces.top].image.width + texturen[enmFaces.bottom].image.width;
  const width_absolute =
    texturen[enmFaces.front].image.width +
    texturen[enmFaces.back].image.width +
    texturen[enmFaces.top].image.height +
    texturen[enmFaces.bottom].image.height;
  const width_mean = width_absolute / 4;

  // const height_absolute = image_sources[tex_front].height + image_sources[tex_back].height + image_sources[tex_left].height + image_sources[tex_right].height;
  // const height_absolute = texturen[enmFaces.front].image.height + texturen[enmFaces.back].image.height + texturen[enmFaces.left].image.width + texturen[enmFaces.right].image.width;
  const height_absolute =
    texturen[enmFaces.front].image.height +
    texturen[enmFaces.back].image.height +
    texturen[enmFaces.left].image.height +
    texturen[enmFaces.right].image.height;
  const height_mean = height_absolute / 4;

  // const depth_absolute = image_sources[tex_top].height + image_sources[tex_bottom].height + image_sources[tex_left].width + image_sources[tex_right].width;
  // const depth_absolute = texturen[enmFaces.top].image.height + texturen[enmFaces.bottom].image.height + texturen[enmFaces.left].image.height + texturen[enmFaces.right].image.height;
  const depth_absolute =
    texturen[enmFaces.top].image.width +
    texturen[enmFaces.bottom].image.width +
    texturen[enmFaces.left].image.width +
    texturen[enmFaces.right].image.width;
  const depth_mean = depth_absolute / 4;

  logger.log("width_mean:", width_mean);
  logger.log("height_mean:", height_mean);
  logger.log("depth_mean:", depth_mean);

  // We assume width = 1, all others must adhere to that
  dimensions.height = height_mean / width_mean;
  dimensions.depth = depth_mean / width_mean;

  dimensions.width *= zoom;
  dimensions.height *= zoom;
  dimensions.depth *= zoom;

  initBuffers();

  dimensionsCalculated = true;
}

function initGL(canvas) {
  try {
    //const canvas = document.querySelector('#glcanvas');
    gl = canvas.getContext("webgl", { antialias: true });
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    extAnisotropic = gl.getExtension("EXT_texture_filter_anisotropic");
  } catch (e) {}
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

function getShader(gl, id) {
  const shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  const str = shaderScript.text;

  let shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initShaders() {
  const fragmentShader = getShader(gl, "shader-fs");
  const vertexShader = getShader(gl, "shader-vs");

  shaderProgram = {};
  shaderProgram.program = gl.createProgram();

  // shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram.program, vertexShader);
  gl.attachShader(shaderProgram.program, fragmentShader);
  gl.linkProgram(shaderProgram.program);

  if (!gl.getProgramParameter(shaderProgram.program, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram.program);

  shaderProgram.program.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram.program,
    "aVertexPosition"
  );
  gl.enableVertexAttribArray(shaderProgram.program.vertexPositionAttribute);

  shaderProgram.program.textureCoordAttribute = gl.getAttribLocation(
    shaderProgram.program,
    "aTextureCoord"
  );
  gl.enableVertexAttribArray(shaderProgram.program.textureCoordAttribute);

  shaderProgram.program.pMatrixUniform = gl.getUniformLocation(
    shaderProgram.program,
    "uPMatrix"
  );
  shaderProgram.program.mvMatrixUniform = gl.getUniformLocation(
    shaderProgram.program,
    "uMVMatrix"
  );
  shaderProgram.program.samplerUniform = gl.getUniformLocation(
    shaderProgram.program,
    "uSampler"
  );
}

function initTexture(sFilename, textures) {
  const anz = textures.length;
  textures[anz] = {};
  textures[anz].texture = gl.createTexture();

  textures[anz].image = new Image();
  textures[anz].image.onload = function () {
    textures[anz].isLoaded = true;

    gl.bindTexture(gl.TEXTURE_2D, textures[anz].texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      textures[anz].image
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //gl.NEAREST
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); //gl.NEAREST

    if (
      extAnisotropic &&
      gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT) > 1
    ) {
      logger.log(
        "Anisotropic Filtering enabled:",
        gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      );
      gl.texParameterf(
        gl.TEXTURE_2D,
        extAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
        extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      );
    }

    allTexturesLoaded = true;
    textures.forEach(function (tex) {
      if (!tex.isLoaded) {
        allTexturesLoaded = false;
      }
    });

    document.getElementById("loading-counter").innerText = textures.filter(
      (tex) => tex.isLoaded
    ).length;

    if (allTexturesLoaded) {
      logger.log("all textures loaded!");

      // TODO: fade-out
      document.getElementById("loading").style.display = "none";
    }
  };
  textures[anz].image.src = sFilename;
}

function mvPushMatrix() {
  const copy = glMatrix.mat4.create();
  glMatrix.mat4.copy(copy, mvMatrix);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.program.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.program.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function initBuffers() {
  logger.log("initializing buffers");

  vertBuffer = {};
  vertBuffer.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer.buffer);
  const vertices = [
    // Front face
    -1.0 * dimensions.width,
    -1.0 * dimensions.height,
    1.0 * dimensions.depth,
    1.0 * dimensions.width,
    -1.0 * dimensions.height,
    1.0 * dimensions.depth,
    1.0 * dimensions.width,
    1.0 * dimensions.height,
    1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    1.0 * dimensions.height,
    1.0 * dimensions.depth,

    // Back face
    -1.0 * dimensions.width,
    -1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    1.0 * dimensions.width,
    1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    1.0 * dimensions.width,
    -1.0 * dimensions.height,
    -1.0 * dimensions.depth,

    // Top face
    -1.0 * dimensions.width,
    1.0 * dimensions.height,
    1.0 * dimensions.depth,
    1.0 * dimensions.width,
    1.0 * dimensions.height,
    1.0 * dimensions.depth,
    1.0 * dimensions.width,
    1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    1.0 * dimensions.height,
    -1.0 * dimensions.depth,

    // Bottom face
    -1.0 * dimensions.width,
    -1.0 * dimensions.height,
    1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    -1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    1.0 * dimensions.width,
    -1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    1.0 * dimensions.width,
    -1.0 * dimensions.height,
    1.0 * dimensions.depth,

    // Right face
    1.0 * dimensions.width,
    1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    1.0 * dimensions.width,
    1.0 * dimensions.height,
    1.0 * dimensions.depth,
    1.0 * dimensions.width,
    -1.0 * dimensions.height,
    1.0 * dimensions.depth,
    1.0 * dimensions.width,
    -1.0 * dimensions.height,
    -1.0 * dimensions.depth,

    // Left face
    -1.0 * dimensions.width,
    1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    -1.0 * dimensions.height,
    -1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    -1.0 * dimensions.height,
    1.0 * dimensions.depth,
    -1.0 * dimensions.width,
    1.0 * dimensions.height,
    1.0 * dimensions.depth,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  vertBuffer.itemSize = 3;
  vertBuffer.numItems = 24;

  coordBuffer = {};
  coordBuffer.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer.buffer);
  const textureCoords = [
    // Front face
    0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,

    // Back face
    1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,

    // Top face
    1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,

    // Bottom face
    1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,

    // Right face
    0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,

    // Left face
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoords),
    gl.STATIC_DRAW
  );
  coordBuffer.itemSize = 2;
  coordBuffer.numItems = 24;

  IndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);
  const Indices = [
    0,
    1,
    2,
    0,
    2,
    3, // Front face
    4,
    5,
    6,
    4,
    6,
    7, // Back face
    8,
    9,
    10,
    8,
    10,
    11, // Top face
    12,
    13,
    14,
    12,
    14,
    15, // Bottom face
    16,
    17,
    18,
    16,
    18,
    19, // Right face
    20,
    21,
    22,
    20,
    22,
    23, // Left face
  ];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(Indices),
    gl.STATIC_DRAW
  );
  IndexBuffer.itemSize = 1;
  IndexBuffer.numItems = 36;
}

function drawScene() {
  if (!allTexturesLoaded) {
    // TODO: idle animation?
    return;
  }

  // calc dimensions
  calculateDimensions();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //var scalelocation = gl.getUniformLocation(shaderProgram, 'u_scale');

  //gl.uniform2fv(scalelocation, [2, 2]);

  glMatrix.mat4.perspective(
    pMatrix,
    perspectiveAngle,
    gl.viewportWidth / gl.viewportHeight,
    0.1,
    100.0
  );

  glMatrix.mat4.identity(mvMatrix);

  glMatrix.mat4.translate(mvMatrix, mvMatrix, [perspectiveX, perspectiveY, -5.0]);

  glMatrix.mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1, 0, 0]);
  glMatrix.mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0, 1, 0]);
  glMatrix.mat4.rotate(mvMatrix, mvMatrix, degToRad(zRot), [0, 0, 0]);

  setMatrixUniforms();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer.buffer);
  gl.vertexAttribPointer(
    shaderProgram.program.vertexPositionAttribute,
    vertBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer.buffer);
  gl.vertexAttribPointer(
    shaderProgram.program.textureCoordAttribute,
    coordBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);

  // Draw face 0
  gl.bindTexture(gl.TEXTURE_2D, texturen[0].texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  // Draw face 1
  gl.bindTexture(gl.TEXTURE_2D, texturen[1].texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12);

  // Draw face 2
  gl.bindTexture(gl.TEXTURE_2D, texturen[2].texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24);

  // Draw face 3
  gl.bindTexture(gl.TEXTURE_2D, texturen[3].texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 36);

  // Draw face 4
  gl.bindTexture(gl.TEXTURE_2D, texturen[4].texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 48);

  // Draw face 5
  gl.bindTexture(gl.TEXTURE_2D, texturen[5].texture);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 60);
}

function animate() {
  if (!allTexturesLoaded) return;

  const timeNow = new Date().getTime();

  if (dragMode === enmDragMode.none && lastDragMode === enmDragMode.rotate) {
    dX *= opts.rotation_amortization;
    dY *= opts.rotation_amortization;
    THETA += opts.rotation_speed * dX;
    PHI += opts.rotation_speed * dY;
  }

  if (lastTime != 0) {
    const elapsed = timeNow - lastTime;

    xRot = PHI;
    yRot = THETA;
  }
  lastTime = timeNow;
}

function redraw() {
  requestAnimationFrame(redraw);
  drawScene();
  animate();
}
// #endregion WebGL

// #region Mouse and Touch Handling
/*
  ####################################
  ##    MOUSE AND TOUCH HANDLING    ##
  ####################################
*/
// Mousedrag rotation with amortization https://www.tutorialspoint.com/webgl/webgl_interactive_cube.htm
const enmDragMode = {
  none: 0,
  rotate: 1,
  move: 2,
};

let dragMode = enmDragMode.none;
let lastDragMode = enmDragMode.rotate; // initialize it with "rotate" so we can have our little rotation intro animation
let old_x, old_y;
let dX, dY;

const rotate = function (e) {
  dX = ((e.pageX - old_x) * 2 * Math.PI) / canvas.width;
  dY = ((e.pageY - old_y) * 2 * Math.PI) / canvas.height;

  THETA += opts.rotation_speed * dX;
  PHI += opts.rotation_speed * dY;

  (old_x = e.pageX), (old_y = e.pageY);
  e.preventDefault();
};

const move = function (e) {
  dX = ((e.pageX - old_x) * 2 * Math.PI) / canvas.width;
  dY = ((e.pageY - old_y) * 2 * Math.PI) / canvas.height;

  perspectiveX += dX;
  perspectiveY -= dY;

  (old_x = e.pageX), (old_y = e.pageY);
  e.preventDefault();
};

let perspectiveAngle = 45;
let perspectiveX = 0;
let perspectiveY = 0;

const mouseWheel = function (event) {
  if (!allTexturesLoaded) return;

  if (event.deltaY !== 0) {
    perspectiveAngle += event.deltaY < 0 ? -0.02 : 0.02;
  }
  if (perspectiveAngle < 44) perspectiveAngle = 44;
  if (perspectiveAngle > 46) perspectiveAngle = 46;

  logger.log("perspectiveAngle:", perspectiveAngle);

  event.preventDefault();
};

const keyDown = function (event) {
  logger.log("keyDown:", event);

  let x = 0;
  let y = 0;

  if (event.code === "ArrowUp" || event.code === "KeyW") {
    y = -0.1;
  }

  if (event.code === "ArrowDown" || event.code === "KeyS") {
    y = 0.1;
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    x = -0.1;
  }

  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    x = 0.1;
  }

  perspectiveX += x;
  perspectiveY += y;
  //event.preventDefault();
};

const pointerCache = new Array();
const pinch = {
  initialPerspectiveAngle: null, // float; the perspective Angle when the second pointer is added
  initialDistance: null, // float; the distance between pointers when the second pointer is added
  initialCenter: null, // { x: float, y: float }; the center between pointers when the second pointer is added
};

function getDistance(point1, point2) {
  const a = point1.clientX - point2.clientX;
  const b = point1.clientY - point2.clientY;

  return Math.sqrt(a * a + b * b);
}

function getCenter(point1, point2) {
  const x = (point1.clientX + point2.clientX) / 2;
  const y = (point1.clientY + point2.clientY) / 2;

  return { x, y };
}

function onPointerDown(e) {
  // The pointerdown event signals the start of a touch interaction.
  // This event is cached to support 2-finger gestures
  // logger.log("onPointerDown", e);

  if (!pointerCache.find((pointer) => pointer.pointerId === e.pointerId)) {
    pointerCache.push(e);
  }

  if (pointerCache.length === 1) {
    // initialize rotate/move with held button
    if (e.buttons === 1) {
      dragMode = enmDragMode.rotate;
    } else if (e.buttons === 2) {
      dragMode = enmDragMode.move;
    } else {
      dragMode = enmDragMode.none;
    }

    (old_x = e.pageX), (old_y = e.pageY);
  }

  if (pointerCache.length === 2) {
    // initialize zoom with 2 pointers
    pinch.initialPerspectiveAngle = perspectiveAngle;
    pinch.initialDistance = getDistance(pointerCache[0], pointerCache[1]);
    pinch.initialCenter = getCenter(pointerCache[0], pointerCache[1]);

    // initialize move with 2 pointers
    dragMode = enmDragMode.move;
    const center = getCenter(pointerCache[0], pointerCache[1]);

    old_x = center.x;
    old_y = center.y;
  }

  e.preventDefault();
  return false;
}

function onPointerMove(e) {
  // logger.log("onPointerMove", e);

  // Update pointerCache
  for (let i = 0; i < pointerCache.length; i++) {
    if (e.pointerId == pointerCache[i].pointerId) {
      pointerCache[i] = e;
      break;
    }
  }

  if (pointerCache.length === 1) {
    if (dragMode === enmDragMode.none) {
      return false;
    } else if (dragMode === enmDragMode.rotate) {
      rotate(e);
    } else if (dragMode === enmDragMode.move) {
      move(e);
    }
  }

  if (pointerCache.length === 2) {
    // pinch zoom
    const distance = getDistance(pointerCache[0], pointerCache[1]);

    const diff = pinch.initialDistance - distance;

    perspectiveAngle = pinch.initialPerspectiveAngle + diff * 0.01;

    if (perspectiveAngle < 44) perspectiveAngle = 44;
    if (perspectiveAngle > 46) perspectiveAngle = 46;

    // 2 pointers move
    const center = getCenter(pointerCache[0], pointerCache[1]);
    move({ pageX: center.x, pageY: center.y });
  }

  e.preventDefault();
  return false;
}

function onPointerUp(e) {
  logger.log("onPointerUp", e);

  if (pointerCache.length === 1) {
    lastDragMode = dragMode;
    dragMode = enmDragMode.none;
  }

  // Remove this pointer from the pointerCache
  for (let i = 0; i < pointerCache.length; i++) {
    if (pointerCache[i].pointerId == e.pointerId) {
      pointerCache.splice(i, 1);
      break;
    }
  }

  e.preventDefault();
  return false;
}
// #endregion Mouse and Touch Handling

// #region Main
/*
  ################
  ##    MAIN    ##
  ################
*/
const canvas = document.querySelector("#glcanvas");

function init() {
  logger.log("config:", config);

  document.getElementById("gldiv").style.opacity = "1";

  opts.name = getQueryVariable("name") || opts.name;
  opts.name = opts.name
    .replace(/%2F/g, "/")
    .replace(/%2520/g, " ")
    .replace(/\+/g, " ");

  opts.path = getQueryVariable("path") || config.path || opts.path;
  opts.path = opts.path
    ? opts.path.replace(/%2F/g, "/").replace(/%2520/g, " ").replace(/\+/g, " ")
    : null;

  opts.ext = getQueryVariable("ext") || config.ext || opts.ext;
  opts.bgext = getQueryVariable("bgext") || config.bgext || opts.bgext;

  opts.bgvideo = opts.bgext === "mp4" || false;

  opts.bgvignette = hasValue(getQueryVariable("bgvignette"))
    ? getQueryVariable("bgvignette") === "true" ||
      getQueryVariable("bgvignette") === "1"
    : hasValue(config.bgvignette)
    ? config.bgvignette
    : opts.bgvignette;

  opts.bgpattern = hasValue(getQueryVariable("bgpattern"))
    ? getQueryVariable("bgpattern") === "true" ||
      getQueryVariable("bgpattern") === "1"
    : hasValue(config.bgpattern)
    ? config.bgpattern
    : opts.bgpattern;

  opts.bg = "#" + (getQueryVariable("bg") || config.bg || opts.bg);

  opts.rotation_speed = config.rotation_speed || opts.rotation_speed;
  opts.rotation_amortization =
    config.rotation_amortization || opts.rotation_amortization;
  opts.rotation_initial_x =
    config.rotation_initial_x || opts.rotation_initial_x;
  opts.rotation_initial_y =
    config.rotation_initial_y || opts.rotation_initial_y;

  // initial rotation
  const amortization_factor =
    Math.abs(
      (0.91 - opts.rotation_amortization) *
        (0.91 - opts.rotation_amortization) *
        (0.91 - opts.rotation_amortization) *
        25000
    ) + 1;
  dX =
    (opts.rotation_initial_x * (20 / opts.rotation_speed)) /
    amortization_factor;
  dY =
    (opts.rotation_initial_y * (20 / opts.rotation_speed)) /
    amortization_factor;

  document.getElementById("gldiv").style.backgroundColor = opts.bg;
  document.getElementById("bg0").style.backgroundColor = opts.bg;
  document.getElementById("bg1").style.backgroundColor = opts.bg;

  logger.log("opts:", opts);

  if (self !== top) {
    // The current window is nested within an <iframe> or <object>.
    logger.log("embedding detected");
    document.getElementById("openexclusively").style.display = "block";
  } else {
    logger.log("no embedding detected");
  }

  if (config.extlink && config.extlink_innerhtml) {
    document.getElementById("extlink_a").href = config.extlink;
    document.getElementById("extlink_a").innerHTML = config.extlink_innerhtml;
  }
}

function webGLStart() {
  // calcDimensions();

  window.addEventListener("resizeCanvas", canvas, false);

  canvas.addEventListener("wheel", mouseWheel, false);

  window.addEventListener("keydown", keyDown, false);

  canvas.onpointerdown = onPointerDown;
  canvas.onpointermove = onPointerMove;

  // Use same handler for pointer{up,cancel,out,leave} events since
  // the semantics for these events - in this app - are the same.
  canvas.onpointerup = onPointerUp;
  canvas.onpointercancel = onPointerUp;
  canvas.onpointerout = onPointerUp;
  canvas.onpointerleave = onPointerUp;

  // Runs each time the DOM window resize event fires.
  // Resets the canvas dimensions to match window,
  // then draws the new borders accordingly.
  function resizeCanvas() {
    logger.log("resize canvas!");
    canvas.width = window.innerWidth; // -20
    canvas.height = window.innerHeight; // -20
    redraw();
  }

  resizeCanvas();

  //const gl = canvas.getContext('webgl');

  //var canvas = document.getElementById("glcanvas");
  initGL(canvas);
  initShaders();
  // initBuffers();

  const baseFullPath = (config.host || "") + (opts.path || "") + opts.name;

  // Background Image (inspired by http://bigboxcollection.com/)
  getNextBg(baseFullPath, opts.bgext || opts.ext, opts.bgvideo);
  if (!opts.bgvideo) {
    bgimgData.bgChangeInterval = setInterval(() => {
      getNextBg(baseFullPath, opts.bgext || opts.ext);
    }, opts.bginterval * 1000);
  }

  if (
    opts.bgvignette === "true" ||
    opts.bgvignette === true ||
    opts.bgvignette == 1
  ) {
    document.getElementById("glcanvas").style.boxShadow =
      "inset 0 2px 10em 2px rgba(0, 0, 0, 0.8)";
  }

  if (
    opts.bgpattern === "true" ||
    opts.bgpattern === true ||
    opts.bgpattern == 1
  ) {
    document.getElementById("bgfilter").style.opacity = 1;
  }

  document.getElementById("loading-total").innerText = "6";

  initTexture(baseFullPath + "front." + opts.ext, texturen);
  initTexture(baseFullPath + "back." + opts.ext, texturen);
  initTexture(baseFullPath + "top." + opts.ext, texturen);
  initTexture(baseFullPath + "bottom." + opts.ext, texturen);
  initTexture(baseFullPath + "right." + opts.ext, texturen);
  initTexture(baseFullPath + "left." + opts.ext, texturen);

  // gl.clearColor(
  //   hexToRgb(opts.bg).r / 255,
  //   hexToRgb(opts.bg).g / 255,
  //   hexToRgb(opts.bg).b / 255,
  //   0.0
  // );
  gl.enable(gl.DEPTH_TEST);
  redraw();
}

function getNextBg(baseFullPath, ext, video) {
  logger.log("[getNextBg] bgimgData.currentBgNum:", bgimgData.currentBgNum);

  if (video) {
    document.getElementById("bgvideosource").src =
      baseFullPath + "bg" + "." + ext;
    document.getElementById("bgvideosource").type = "video/mp4";
    document.getElementById("bgvideo").style.opacity = "1";
    document.getElementById("bgvideo").load();
    document.getElementById("bgvideo").play(); // this can fail
    document.getElementById("bgvideocontrols").style.display = "block";
    updateBgVideoPlayPause();
    return;
  }

  const url = baseFullPath + "bg" + bgimgData.currentBgNum + "." + ext;

  if (
    bgimgData.maxBgNum !== -1 &&
    bgimgData.currentBgNum > bgimgData.maxBgNum
  ) {
    bgimgData.currentBgNum = 0;
  }

  if (bgimgData.cache[bgimgData.currentBgNum]) {
    applyBgImage(bgimgData.cache[bgimgData.currentBgNum]);
    bgimgData.currentBgNum++;
    return;
  }

  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      logger.log("bgimgFetch response:", response);
      if (response.status !== 200) {
        throw new Error("bgimgFetch failed with status " + response.status);
      }
      return response.blob();
    })
    .then((data) => {
      if (!data) return;

      document.getElementById("glcanvas").style.backgroundColor = "transparent";

      const bgimgURL = URL.createObjectURL(data);
      bgimgData.cache[bgimgData.currentBgNum] = bgimgURL;
      applyBgImage(bgimgURL);
      bgimgData.currentBgNum++;
    })
    .catch((error) => {
      logger.log(error);

      if (bgimgData.currentBgNum === 0) {
        // we couldn't even fetch the first image
        clearInterval(bgimgData.bgChangeInterval);

        if (opts.bgpattern) {
          document.getElementById("glcanvas").style.backgroundSize = "auto";
          document.getElementById("glcanvas").style.backgroundPosition =
            "0% 0%";
          document.getElementById("glcanvas").style.backgroundImage =
            'url("bg-pattern.png")';
        }
        if (opts.bgvignette) {
          document.getElementById("glcanvas").style.boxShadow =
            "rgba(0, 0, 0, 0.8) 0px 2px 10em 2px inset";
        }
        document.getElementById("glcanvas").style.backgroundColor = opts.bg;

        return;
      }

      bgimgData.maxBgNum = bgimgData.currentBgNum - 1;

      bgimgData.currentBgNum = 0;

      applyBgImage(bgimgData.cache[0]);
      bgimgData.currentBgNum++;
    });
}

function applyBgImage(bgimgURL) {
  const currentBgDiv = "bg" + (bgimgData.currentBgNum % 2);
  const otherBgDiv = "bg" + ((bgimgData.currentBgNum + 1) % 2);

  logger.log(
    "[applyBgImage] currentBgNum:",
    bgimgData.currentBgNum,
    "currentBgDiv:",
    currentBgDiv,
    "otherBgDiv:",
    otherBgDiv
  );

  if (
    document.getElementById(currentBgDiv).style.backgroundSize !== "100% 100%"
  ) {
    document.getElementById(currentBgDiv).style.backgroundSize = "100% 100%";
    document.getElementById(currentBgDiv).style.backgroundPosition = "50% 50%";
  }

  document.getElementById(currentBgDiv).style.backgroundImage =
    "url('" + bgimgURL + "')";
  document.getElementById(otherBgDiv).style.opacity = 0;
  document.getElementById(currentBgDiv).style.opacity = 1;
}

function bgVideoPlayPause() {
  const video = document.getElementById("bgvideo");
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  updateBgVideoPlayPause();
}

function updateBgVideoPlayPause() {
  const video = document.getElementById("bgvideo");
  if (video.paused) {
    document.getElementById("bgvideocontrols").innerText = "⏵";
  } else {
    document.getElementById("bgvideocontrols").innerText = "⏸";
  }
}

init();

webGLStart();
// #endregion Main
