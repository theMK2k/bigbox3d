/**
 * BIG BOX 3D v1.0.0
 * ©2020 Jörg "MK2k" Sonntag
 */

const opts = {
    name: 'template-',  // the base name of the image files, e.g. "?name=Ultimate%20DOOM-" if you have files named "Ultimate DOOM-front.jpg", "Ultimate DOOM-back.jpg" etc.
    path: null,         // base path to files, e.g. "?path=/img/" if files are in "img" sub-directory
    ext: 'jpg',         // the file extension of the files, e.g. "?ext=png" if you have .png files
    bg: '999999',      // the background color, e.g. "ffffff" if you want it white (IMPORTANT: please always use 6 hex characters!)
}

let basePath = '';

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
    left: 5
}

const dimensions = {
    width: 1,
    height: 1,
    depth: 1
}

let zoom = 1.4;

let dimensionsCalculated = false;

function calculateDimensions() {
    if (dimensionsCalculated) {
        return;
    }

    console.log('texturen:', texturen);

    // var width_absolute = image_sources[tex_front].width + image_sources[tex_back].width + image_sources[tex_top].width + image_sources[tex_bottom].width;
    const width_absolute = texturen[enmFaces.front].image.width + texturen[enmFaces.back].image.width + texturen[enmFaces.top].image.width + texturen[enmFaces.bottom].image.width;
    const width_mean = width_absolute / 4;

    // var height_absolute = image_sources[tex_front].height + image_sources[tex_back].height + image_sources[tex_left].height + image_sources[tex_right].height;
    const height_absolute = texturen[enmFaces.front].image.height + texturen[enmFaces.back].image.height + texturen[enmFaces.left].image.width + texturen[enmFaces.right].image.width;
    const height_mean = height_absolute / 4;

    // var depth_absolute = image_sources[tex_top].height + image_sources[tex_bottom].height + image_sources[tex_left].width + image_sources[tex_right].width;
    const depth_absolute = texturen[enmFaces.top].image.height + texturen[enmFaces.bottom].image.height + texturen[enmFaces.left].image.height + texturen[enmFaces.right].image.height;
    const depth_mean = depth_absolute / 4;

    console.log('width_mean:', width_mean);
    console.log('height_mean:', height_mean);
    console.log('depth_mean:', depth_mean);

    // We assume width = 1, all others must adhere to that
    dimensions.height = (height_mean / width_mean);
    dimensions.depth = (depth_mean / width_mean);

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
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    const shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    str = shaderScript.text;

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


let shaderProgram;

function initShaders() {
    const fragmentShader = getShader(gl, "shader-fs");
    const vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    // This is a bad code.
    // If the context is lsot shaderProgram will be null
    // and trying to assign a vertexPositionAttribute to null
    // will throw an exception.
    // better would be 
    // shaderProgram = {};
    // shaderProgram.program = gl.createProgram();
    // shaderProgram.vertexPositionAtrribute = ...
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

}


const texturen = new Array();
let allTexturesLoaded = false;
function initTexture(sFilename, textures) {
    const anz = textures.length;
    textures[anz] = gl.createTexture();

    //texturen[anz].generateMipmaps = false;

    // this is a bad code. on context lost gl.createTexture() will return null and
    // an exception will be thrown when you try to attach .image to null
    // Better would be
    // texturen[anz] = {};
    // texturen[anz].texture = gl.createTexture();
    // texturen[anz].image = new Image();
    textures[anz].image = new Image();
    textures[anz].image.onload = function () {
        textures[anz].isLoaded = true;

        gl.bindTexture(gl.TEXTURE_2D, textures[anz]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[anz].image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);  //gl.NEAREST
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  //gl.NEAREST

        if (extAnisotropic && gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT) > 1) {
            console.log('Anisotropic Filtering enabled:', gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
            gl.texParameterf(gl.TEXTURE_2D, extAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        }

        allTexturesLoaded = true;
        textures.forEach(function (tex) {
            if (!tex.isLoaded) {
                allTexturesLoaded = false;
            }
        });

        if (allTexturesLoaded) {
            console.log('all textures loaded!');
        }
    }
    textures[anz].image.src = sFilename;
}

const mvMatrix = mat4.create();
const mvMatrixStack = [];
const pMatrix = mat4.create();

function mvPushMatrix() {
    const copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    // Scaling
    // https://www.tutorialspoint.com/webgl/webgl_scaling.htm
    // let xformMatrix = new Float32Array([
    // 	dimensions.width,   0.0,  0.0,  0.0,
    //    0.0,  dimensions.height,   0.0,  0.0,
    //    0.0,  0.0,  dimensions.depth,   0.0,
    //    0.0,  0.0,  0.0,  1.0  
    // ]);
    // console.log('xformMatrix:', xformMatrix);

    // let u_xformMatrix = gl.getUniformLocation(shaderProgram, 'u_xformMatrix');
    // gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    // Scaling End
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function initBuffers() {
    console.log('initializing buffers');

    vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    const vertices = [
        // Front face
        -1.0 * dimensions.width, -1.0 * dimensions.height, 1.0 * dimensions.depth,
        1.0 * dimensions.width, -1.0 * dimensions.height, 1.0 * dimensions.depth,
        1.0 * dimensions.width, 1.0 * dimensions.height, 1.0 * dimensions.depth,
        -1.0 * dimensions.width, 1.0 * dimensions.height, 1.0 * dimensions.depth,

        // Back face
        -1.0 * dimensions.width, -1.0 * dimensions.height, -1.0 * dimensions.depth,
        -1.0 * dimensions.width, 1.0 * dimensions.height, -1.0 * dimensions.depth,
        1.0 * dimensions.width, 1.0 * dimensions.height, -1.0 * dimensions.depth,
        1.0 * dimensions.width, -1.0 * dimensions.height, -1.0 * dimensions.depth,

        // Top face
        -1.0 * dimensions.width, 1.0 * dimensions.height, -1.0 * dimensions.depth,
        -1.0 * dimensions.width, 1.0 * dimensions.height, 1.0 * dimensions.depth,
        1.0 * dimensions.width, 1.0 * dimensions.height, 1.0 * dimensions.depth,
        1.0 * dimensions.width, 1.0 * dimensions.height, -1.0 * dimensions.depth,

        // Bottom face
        -1.0 * dimensions.width, -1.0 * dimensions.height, -1.0 * dimensions.depth,
        1.0 * dimensions.width, -1.0 * dimensions.height, -1.0 * dimensions.depth,
        1.0 * dimensions.width, -1.0 * dimensions.height, 1.0 * dimensions.depth,
        -1.0 * dimensions.width, -1.0 * dimensions.height, 1.0 * dimensions.depth,

        // Right face
        1.0 * dimensions.width, -1.0 * dimensions.height, -1.0 * dimensions.depth,
        1.0 * dimensions.width, 1.0 * dimensions.height, -1.0 * dimensions.depth,
        1.0 * dimensions.width, 1.0 * dimensions.height, 1.0 * dimensions.depth,
        1.0 * dimensions.width, -1.0 * dimensions.height, 1.0 * dimensions.depth,

        // Left face
        -1.0 * dimensions.width, -1.0 * dimensions.height, -1.0 * dimensions.depth,
        -1.0 * dimensions.width, -1.0 * dimensions.height, 1.0 * dimensions.depth,
        -1.0 * dimensions.width, 1.0 * dimensions.height, 1.0 * dimensions.depth,
        -1.0 * dimensions.width, 1.0 * dimensions.height, -1.0 * dimensions.depth,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // This is bad code. See the above examples of bad code.
    // vertBuffer will be null on context lost and this code
    // will throw an exception.
    vertBuffer.itemSize = 3;
    vertBuffer.numItems = 24;

    CoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CoordBuffer);
    const textureCoords = [
        // Front face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,

        // Back face
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,

        // Top face
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,

        // Bottom face
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        // Right face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    CoordBuffer.itemSize = 2;
    CoordBuffer.numItems = 24;

    IndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);
    const Indices = [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 5, 6, 4, 6, 7,    // Back face
        8, 9, 10, 8, 10, 11,  // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Indices), gl.STATIC_DRAW);
    IndexBuffer.itemSize = 1;
    IndexBuffer.numItems = 36;
}


let xRot = 0;
let yRot = 0;
let zRot = 0;

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

    mat4.perspective(pMatrix, perspectiveAngle, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, mvMatrix, [perspectiveX, perspectiveY, -5.0]);

    mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(zRot), [0, 0, 0]);

    setMatrixUniforms();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, CoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, CoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBuffer);

    // Draw face 0
    gl.bindTexture(gl.TEXTURE_2D, texturen[0]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // Draw face 1
    gl.bindTexture(gl.TEXTURE_2D, texturen[1]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12);

    // Draw face 2
    gl.bindTexture(gl.TEXTURE_2D, texturen[2]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24);

    // Draw face 3
    gl.bindTexture(gl.TEXTURE_2D, texturen[3]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 36);

    // Draw face 4
    gl.bindTexture(gl.TEXTURE_2D, texturen[4]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 48);

    // Draw face 5
    gl.bindTexture(gl.TEXTURE_2D, texturen[5]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 60);
}


let lastTime = 0;

let THETA = 0;
let PHI = 0;

function animate() {
    if (!allTexturesLoaded) return;

    const timeNow = new Date().getTime();

    if ( dragMode === enmDragMode.none && lastDragMode === enmDragMode.rotate) {
        dX *= AMORTIZATION;
        dY *= AMORTIZATION;
        THETA += 20 * dX;
        PHI += 20 * dY;
    }

    if (lastTime != 0) {
        const elapsed = timeNow - lastTime;

        //xRot += (90 * elapsed) / 5000.0;
        //yRot += (90 * elapsed) / 5000.0;
        xRot = PHI;
        yRot = THETA;
        //zRot += (90 * elapsed) / 5000.0;
    }
    lastTime = timeNow;
}


function tick() {
    requestAnimationFrame(tick);
    drawScene();
    animate();
}

// Mousedrag rotation with amortization
// https://www.tutorialspoint.com/webgl/webgl_interactive_cube.htm
const enmDragMode = {
    none: 0,
    rotate: 1,
    move: 2
}

/*================= Mouse events ======================*/

const AMORTIZATION = 0.91;
let dragMode = enmDragMode.none;
let lastDragMode = enmDragMode.rotate;  // initialize it with "rotate" so we can have our little rotation intro animation
let old_x, old_y;
let dX = 0.1, dY = -0.1;

const mouseDown = function (e) {
    
    if (e.buttons === 1) {
        dragMode = enmDragMode.rotate;
    } else if (e.buttons === 2) {
        dragMode = enmDragMode.move;
    } else {
        dragMode = enmDragMode.none;
    }

    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

const mouseUp = function (e) {
    lastDragMode = dragMode;
    dragMode = enmDragMode.none;

    e.preventDefault();
    return false;
};

const mouseMove = function (e) {
    if (dragMode === enmDragMode.none) {
        return false;
    } else if (dragMode === enmDragMode.rotate) {
        rotateByMouse(e);
    } else if (dragMode === enmDragMode.move) {
        moveByMouse(e);
    }
};

const rotateByMouse = function(e) {
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width;
    dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;

    THETA += 20 * dX;
    PHI += 20 * dY;

    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
}

const moveByMouse = function(e) {
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width;
    dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;

    // THETA += 20 * dX;
    // PHI += 20 * dY;
    perspectiveX += dX;
    perspectiveY -= dY;
    
    
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
}

let perspectiveAngle = 45;
let perspectiveX = 0;
let perspectiveY = 0;

const mouseWheel = function (event) {
    if (!allTexturesLoaded) return;

    perspectiveAngle += (event.deltaY < 0) ? -0.02 : 0.02;
    if (perspectiveAngle < 44) perspectiveAngle = 44;
    if (perspectiveAngle > 46) perspectiveAngle = 46;

    // console.log('perspectiveAngle:', perspectiveAngle);

    event.preventDefault();
};

const keyDown = function (event) {
    console.log('keyDown:', event);

    let x = 0;
    let y = 0;

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        y = -0.1;
    }

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        y = 0.1;
    }

    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        x = -0.1;
    }

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        x = 0.1;
    }

    perspectiveX += x;
    perspectiveY += y;
    //event.preventDefault();
}

/*=========================rotation================*/

function rotateX(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

const canvas = document.querySelector('#glcanvas');

function webGLStart() {

    // calcDimensions();

    window.addEventListener('resizeCanvas', canvas, false);

    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mouseout', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('wheel', mouseWheel, false);

    window.addEventListener('keydown', keyDown, false);

    // Runs each time the DOM window resize event fires.
    // Resets the canvas dimensions to match window,
    // then draws the new borders accordingly.
    function resizeCanvas() {
        canvas.width = window.innerWidth;           // -20
        canvas.height = window.innerHeight - 4;     // -20
        //redraw();
    }
    resizeCanvas();

    //const gl = canvas.getContext('webgl');

    //var canvas = document.getElementById("glcanvas");
    initGL(canvas);
    initShaders();
    // initBuffers();

    const baseFullPath = (opts.path || '') + opts.name;

    initTexture(baseFullPath + 'front.' + opts.ext, texturen);
    initTexture(baseFullPath + 'back.' + opts.ext, texturen);
    initTexture(baseFullPath + 'top.' + opts.ext, texturen);
    initTexture(baseFullPath + 'bottom.' + opts.ext, texturen);
    initTexture(baseFullPath + 'right.' + opts.ext, texturen);
    initTexture(baseFullPath + 'left.' + opts.ext, texturen);

    gl.clearColor(hexToRgb(opts.bg).r / 255., hexToRgb(opts.bg).g / 255., hexToRgb(opts.bg).b / 255., 1.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
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
    return (false);
}

function hexToRgb(hex) {
    const matches = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const rgb = matches ? {
            r: parseInt(matches[1], 16),
            g: parseInt(matches[2], 16),
            b: parseInt(matches[3], 16)
        } : null;
    
    console.log('hexToRgb result:', rgb);

    return rgb;
}

function init() {
    opts.name = getQueryVariable("name") || opts.name;
    opts.path = getQueryVariable("path") || opts.path;
    opts.ext = getQueryVariable("ext") || opts.ext;
    opts.bg = '#' + (getQueryVariable("bg") || opts.bg);

    document.getElementById("glcanvas").style.backgroundColor = opts.bg;

    console.log('opts:', opts);
}

init();

webGLStart();