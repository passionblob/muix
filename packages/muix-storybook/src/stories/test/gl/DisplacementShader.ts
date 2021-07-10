
type DisplacementProperty = {
	texture: THREE.Texture
	map: THREE.Texture
	strength: number
}

export function DisplacementShader({texture, map, strength}: DisplacementProperty) {
	return {
		uniforms: {
			tDiffuse: {value: texture},
			map: {value: map},
			strength: {value: strength},
		},
		vertexShader: `
		varying vec2 v_uv;

    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
		`,
		fragmentShader: `
		uniform float strength;
		uniform sampler2D tDiffuse;
		uniform sampler2D map;

		varying vec2 v_uv;

		void main() {
			vec2 origuv = v_uv;
			vec2 uvForP = origuv;

			vec3 textDisp = texture(map, origuv).xyz;
			uvForP -= (textDisp[0]-0.5)*strength;
			
			vec3 textCol = texture(tDiffuse, uvForP).xyz;

			vec4 p = vec4(textCol.xyz,1.0);

			gl_FragColor = p;
		}
		`,
	}
}