export const GaussianBlurShader = {
	uniforms: {
		tDiffuse: {value: null},
		resolution: {value: {x: 512, y: 512}},
		direction: {value: {x: 1, y: 0}},
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
	uniform vec2 resolution;
	uniform vec2 direction;
	varying vec2 v_uv;

	vec4 blur9(sampler2D image, vec2 uv, vec2 _resolution, vec2 _direction) {
		vec4 color = vec4(0.0);
		vec2 off1 = vec2(1.3846153846) * _direction;
		vec2 off2 = vec2(3.2307692308) * _direction;
		color += texture2D(image, uv) * 0.2270270270;
		color += texture2D(image, uv + (off1 / _resolution)) * 0.3162162162;
		color += texture2D(image, uv - (off1 / _resolution)) * 0.3162162162;
		color += texture2D(image, uv + (off2 / _resolution)) * 0.0702702703;
		color += texture2D(image, uv - (off2 / _resolution)) * 0.0702702703;
		return color;
	}

	void main() {
		gl_FragColor = blur9(tDiffuse, v_uv, resolution, direction);
	}
	`,
}