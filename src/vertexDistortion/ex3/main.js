import "../../style.css"
import createProgram from '../../webgl-boilerplate'

const loadPageSCript = () => {
    console.log('page load first script')
    const CANVAS = document.getElementById('webgl-canvas');
    const pixelRatio = window.devicePixelRatio || 1;
    CANVAS.width = CANVAS.clientWidth * pixelRatio;
    CANVAS.height = CANVAS.clientHeight * pixelRatio;
    const shaders = {};

    shaders.vertexShader = `
        attribute vec2 a_position;// Vertex position (per vertex)
        attribute vec2 a_texCoord;// Texture coordinate (per vertex)

        uniform vec2 u_resolution;// Canvas resolution [width, height]
        uniform vec2 u_mouse;// Mouse position

        varying vec2 v_texCoord;// Pass the texture coordinate to the fragment shader

        void main(){
            // Convert the position from pixels to clip space ([-1, 1])
            vec2 clipSpace=(a_position/u_resolution)*2.-1.;

            // Flip the Y-axis (WebGL has the origin at the bottom-left)
            clipSpace.y=-clipSpace.y;

            vec2 normalizedMouse = (u_mouse / u_resolution) * 2.0 - 1.0;
            normalizedMouse.y = -normalizedMouse.y;
            float distanceVertexToMouse = distance(clipSpace, normalizedMouse);

            // Frequency and Amplitude
            float frequency=5.;
            float amplitude=.1;

            // Add a time-based distortion to the position
            float ripple = sin(distanceVertexToMouse * frequency) * amplitude;
            clipSpace += ripple;

            gl_Position=vec4(clipSpace,0.,1.);

            // Pass the texture coordinates to the fragment shader
            v_texCoord=a_texCoord;
        }
    `
    shaders.fragmentShader = `
        precision highp float;

        uniform sampler2D u_image;// The image texture

        varying vec2 v_texCoord;// Interpolated texture coordinates

        void main(){
            // Sample the texture at the given coordinates
            gl_FragColor=texture2D(u_image,v_texCoord);
        }
    `


    const gl = CANVAS.getContext('webgl');
    const program = createProgram(gl, shaders.vertexShader, shaders.fragmentShader);

    // Set up vertex attributes
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Define a quad covering the canvas (two triangles)
    const positions = [
        0, 0,
        CANVAS.width, 0,
        0, CANVAS.height,
        0, CANVAS.height,
        CANVAS.width, 0,
        CANVAS.width, CANVAS.height
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

    // Texture coordinates (corresponding to the quad)
    const texCoords = [
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    let startTime = performance.now();

    // Create and bind the texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Load an image
    const image = new Image();
    image.src = '/pexels.jpg';
    image.onload = () => {
        // Upload the image into the texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Render the scene
        render();
    };

    const mouse = { x: 0, y: 0 }
    CANVAS.addEventListener('mousemove', function (event) {
        const rect = CANVAS.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });


    const render = () => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use the program
        gl.useProgram(program);

        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const aPositionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(aPositionLocation);
        gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

        // Bind texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const aTexCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(aTexCoordLocation);
        gl.vertexAttribPointer(aTexCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Set resolution uniform
        const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(uResolutionLocation, CANVAS.width, CANVAS.height);

        // Set mouse uniform
        const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');
        gl.uniform2f(uMouseLocation, mouse.x, CANVAS.height - mouse.y);

        // Set time uniform
        /* const uTime = gl.getUniformLocation(program, 'u_time');
        gl.uniform1f(uTime, (performance.now() - startTime) / 1000); */

        // Set the texture uniform
        const uImageLocation = gl.getUniformLocation(program, 'u_image');
        gl.uniform1i(uImageLocation, 0);

        // Draw the quad
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    };
}

window.addEventListener('load', () => loadPageSCript())