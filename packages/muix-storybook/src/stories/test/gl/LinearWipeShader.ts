type LinearWipeProperty = {
	angle?: number
	progress?: number
	feather?: number
	wave?: number
}

const vertexShader = `
varying vec2 v_uv;

void main() {
	v_uv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
#define PI 3.1415926535
uniform sampler2D tDiffuse;
uniform float angle;
uniform float progress;
uniform float feather;
uniform float u_direction;
uniform float wave;
varying vec2 v_uv;
 
const vec2 center = vec2(0.5, 0.5);

float random (vec2 st) {
	return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
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
  vec2 v = normalize(direction);
  v /= abs(v.x)+abs(v.y);

	float d = v.x * center.x + v.y * center.y;
  float m =
    (1.0-step(progress, 0.0)) * 
    (1.0 - smoothstep(-feather, 0.0, v.x * uv.x + v.y * uv.y - (d-0.5+progress*(1.+feather))));
  gl_FragColor = mix(tex, transparent, m);
}
`

export function LinearWipeShader(property: LinearWipeProperty) {
	const degree = (property.angle || 0) % 360;
	
	const uniforms = {
		// transition angle in degree
		angle: { value: degree },
		// transition progress starting from 0 to 1
		progress: { value: property.progress || 0 },
		// feather radius
		feather: { value: property.feather || 0 },
		tDiffuse: { value: null },
		wave: { value: property.wave || 0 },
	}
	
	return {
		uniforms,
		vertexShader,
		fragmentShader,
	}
}