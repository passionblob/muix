export const LinearWipeShader = {
	uniforms: {
		// transition angle in degree
		angle: { value: 0 },
		// transition progress starting from 0 to 1
		progress: { value: 0 },
		// feather radius
		feather: { value: 0 },
		tDiffuse: { value: null },
		wave: { value: 0 },
		scale: { value: 0 },
	},
	vertexShader: `
	varying vec2 v_uv;
	
	void main() {
		v_uv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
	`,
	fragmentShader: `
	#define PI 3.1415926535
	uniform sampler2D tDiffuse;
	uniform float angle;
	uniform float progress;
	uniform float feather;
	uniform float u_direction;
	uniform float scale;
	uniform float wave;
	varying vec2 v_uv;
	 
	const vec2 center = vec2(0.5, 0.5);
	
	float random (vec2 st) {
		return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
	}

	float noise(vec3 x) {
		vec3 p = floor(x);
		vec3 f = fract(x);
		f = f*f*(3.-2.*f);
	
		float n = p.x + p.y*157. + 113.*p.z;
		
		vec4 v1 = fract(753.5453123*sin(n + vec4(0., 1., 157., 158.)));
		vec4 v2 = fract(753.5453123*sin(n + vec4(113., 114., 270., 271.)));
		vec4 v3 = mix(v1, v2, f.z);
		vec2 v4 = mix(v3.xy, v3.zw, f.y);
		return mix(v4.x, v4.y, f.x);
	}

	float fnoise(vec3 p) {
		p = mat3(0.28862355854826727, 0.6997227302779844, 0.6535170557707412,
						0.06997493955670424, 0.6653237235314099, -0.7432683571499161,
						-0.9548821651308448, 0.26025457467376617, 0.14306504491456504)*p;
		return dot(vec4(noise(p), noise(p*2.), noise(p*4.), noise(p*8.)),
							vec4(0.5, 0.25, 0.125, 0.06));
	}
	
	vec2 getDirection() {
		float degree = mod(angle, 360.0);
		float slope = tan(radians(degree));
		float x, y;
		if ((315.0 <= degree && degree < 360.0) || (0.0 <= degree && degree < 45.0)) {
			x = 1.0;
			y = slope * x;
		} else if (45.0 <= degree && degree < 135.0) {
			y = 1.0;
			x = y / slope;
		} else if (135.0 <= degree && degree < 225.0) {
			x = -1.0;
			y = slope * x;
		} else if (225.0 <= degree && degree < 315.0) {
			y = -1.0;
			x = y / slope;
		}
		return vec2(x, y);
	}
	
	void main() {
		vec2 uv = v_uv;
		vec4 tex = texture2D(tDiffuse, uv);
		vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);
	
		vec2 direction = getDirection();
		direction.x += sin(uv.x * wave);
		direction.y += cos(radians(90.0) + uv.y * wave);
		direction.x += fnoise(vec3(uv*scale, 0.0));
		direction.y += fnoise(vec3(uv*scale, 0.0));
		vec2 v = normalize(direction);
		v /= abs(v.x)+abs(v.y);

		float d = v.x * center.x + v.y * center.y;
		float m =
			(1.0-step(progress, 0.0)) * 
			(1.0 - smoothstep(-feather, 0.0, v.x * uv.x + v.y * uv.y - (d-0.5+progress*(1.+feather))));
		gl_FragColor = mix(tex, transparent, m);
	}
	`,
}