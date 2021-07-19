export const DissolveShader = {
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
	uniform vec2 strength;
	uniform sampler2D tDiffuse;
	uniform sampler2D map;

	varying vec2 v_uv;

	void main() {
		vec2 uv = v_uv;
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
	`,
}