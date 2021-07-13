export const BCShader = {
  uniforms: {
    tDiffuse: {value: null},
    brightness: {value: 0.0},
    contrast: {value: 1.0},
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
  uniform float brightness;
  uniform float contrast;

  varying vec2 v_uv;
  
  void main() {
    vec2 uv = v_uv;
    vec3 color = texture2D(tDiffuse, uv).rgb;
    gl_FragColor.rgb = color * contrast + brightness;
    gl_FragColor.a = texture2D(tDiffuse, uv).a;
  }
  `,
}