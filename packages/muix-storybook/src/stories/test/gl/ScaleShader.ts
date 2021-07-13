export const ScaleShader = {
  uniforms: {
    tDiffuse: { value: null },
    scale: {value: {x: 0.8, y: 0.8}},
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
  uniform vec2 scale;
  varying vec2 v_uv;

  void main() {
    vec2 uv = v_uv;
    uv = uv * (1.0 / scale);
    uv.x += (-0.5 + scale.x / 2.0) * (1.0 / scale.x);
    uv.y += (-0.5 + scale.y / 2.0) * (1.0 / scale.y);

    if (uv.x < 0.00 || uv.y < 0.00 || uv.x > 1.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0);
    } else {
      gl_FragColor = texture(tDiffuse, uv);
    }
  }
  `,
}