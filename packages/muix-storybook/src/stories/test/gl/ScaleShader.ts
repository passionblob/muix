export const ScaleShader = {
  uniforms: {
    tDiffuse: { value: null },
    scale: {value: 0.8},
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
  uniform float scale;
  varying vec2 v_uv;

  void main() {
    vec2 uv = v_uv;
    uv = uv * (1.0 / scale);
    uv.x += (-0.5 + scale / 2.0) * (1.0 / scale);
    uv.y += (-0.5 + scale / 2.0) * (1.0 / scale);

    if (uv.x <= 0.0 || uv.y <= 0.0 || uv.x >= 1.0 || uv.y >= 1.0) {
      gl_FragColor = vec4(0.0);
    } else {
      gl_FragColor = texture(tDiffuse, uv);
    }
  }
  `,
}