export const AlphaCheckShader = {
  uniforms: {
    tDiffuse: {value: null},
  },
  vertexShader: `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform sampler2D map;

  varying vec2 v_uv;
  const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
  const vec4 red = vec4(1.0, 0.0, 0.0, 1.0);
  const vec4 yellow = vec4(1.0, 1.0, 0.0, 1.0);
  const vec4 green = vec4(0.0, 1.0, 0.0, 1.0);
  const vec4 cyan = vec4(0.0, 1.0, 1.0, 1.0);
  const vec4 blue = vec4(0.0, 0.0, 1.0, 1.0);
  
  void main() {
    vec2 uv = v_uv;
    vec4 texOrigin = texture2D(tDiffuse, uv);

    if (texOrigin.a < 0.1) {
      gl_FragColor = black;
    } else if (texOrigin.a < 0.2) {
      gl_FragColor = red;
    } else if (texOrigin.a < 0.3) {
      gl_FragColor = yellow;
    } else if (texOrigin.a < 0.4) {
      gl_FragColor = green;
    } else if (texOrigin.a < 0.5) {
      gl_FragColor = cyan;
    } else {
      gl_FragColor = blue;
    }
  }
  `,
}