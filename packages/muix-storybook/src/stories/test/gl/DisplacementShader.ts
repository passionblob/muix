export const DisplacementShader = {
	uniforms: {
		tDiffuse: {value: null},
		map: {value: null},
		strength: {value: 0.5},
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
		vec2 origuv = v_uv;
		vec2 uvForP = origuv;

		vec3 textDisp = texture(map, origuv).xyz;
		uvForP.x -= (textDisp[0]-0.5)*strength.x;
		uvForP.y -= (textDisp[0]-0.5)*strength.y;
		
		gl_FragColor = texture(tDiffuse, uvForP);
	}
	`,
}