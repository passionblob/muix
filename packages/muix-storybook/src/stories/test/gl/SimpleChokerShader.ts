export const SimpleChokerShader = {
  uniforms: {
    tDiffuse: {value: null},
		threshold: {value: 0.5},
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
	uniform float threshold;

	varying vec2 v_uv;

  void main() {
    vec2 uv = v_uv;
		vec4 color = texture(tDiffuse, v_uv);
		if (color.a < threshold) {
			color = vec4(0.0, 0.0, 0.0, 0.0);
		} else {
			// color.a = 1.0;
			color = vec4(1.0, 1.0, 1.0, 1.0);
		}
    gl_FragColor = color;
  }
  `,
}