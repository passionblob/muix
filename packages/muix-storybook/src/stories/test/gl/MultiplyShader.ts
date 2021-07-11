export const MultiplyShader: {
  uniforms: {
    tDiffuse: {value: null | THREE.Texture},
    map: {value: null | THREE.Texture},
  },
  vertexShader: string,
  fragmentShader: string,
} = {
  uniforms: {
    tDiffuse: {value: null},
    map: {value: null},
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
  
  void main() {
    vec2 uv = v_uv;
    gl_FragColor = texture2D(tDiffuse, uv) * texture2D(map, uv);
  }
  `,
}