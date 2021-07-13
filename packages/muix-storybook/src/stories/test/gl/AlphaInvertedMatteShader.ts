
type AlphaMatteProperty = {
	map?: THREE.Texture
	inverted?: boolean
}

export function AlphaInvertedMatteShader({map, inverted = false}: AlphaMatteProperty) {
	return {
		uniforms: {
			tDiffuse: {value: null},
			map: {value: map},
			inverted: {value: inverted}
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
		uniform bool inverted;
	
		varying vec2 v_uv;
	
		void main() {
			vec2 uv = v_uv;
			vec4 texCol = texture(tDiffuse, v_uv);
			vec4 texMap = texture(map, v_uv);

			if (inverted) {
				texMap.a *= (1.0 - texCol.a);
				gl_FragColor = texMap;
			} else {
				texCol.a *= (1.0 - texMap.a);
				gl_FragColor = texCol;
			}
		}
		`,
	}
}

