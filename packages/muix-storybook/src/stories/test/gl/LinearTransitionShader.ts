type LinearTransitionProperty = {
	angle?: number
	progress?: number
	feather?: number
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
uniform vec2 u_resolution;
varying vec2 v_uv;

float getYIntercept() {
	float degree = angle - (360.0 * floor(angle / 360.0));
	if (
		degree == 0.0 ||
		degree == 90.0 ||
		degree == 180.0 ||
		degree == 270.0 ||
		degree == 360.0
	) {
		return 0.0;
	}

	float perpendicularAngle = angle + 90.0;
	float rad = radians(perpendicularAngle);
	vec2 sides[2];
	if (degree > 0.0 && degree < 90.0) {
		sides[0] = vec2(1.0, 1.0);
		sides[1] = vec2(0.0, 0.0);
	} else if (degree > 90.0 && degree < 180.0) {
		sides[0] = vec2(0.0, 1.0);
		sides[1] = vec2(1.0, 0.0);
	} else if (degree > 180.0 && degree < 270.0) {
		sides[0] = vec2(0.0, 0.0);
		sides[1] = vec2(1.0, 1.0);
	} else if (degree > 270.0 && degree < 360.0) {
		sides[0] = vec2(1.0, 0.0);
		sides[1] = vec2(0.0, 1.0);
	}

	float end0 = sides[0].y - tan(rad) * sides[0].x;
	float end1 = sides[1].y - tan(rad) * sides[1].x;
	float interpolated = end0 + (end1 - end0) * progress;
	return interpolated;
}

void main() {
	float degree = angle - (360.0 * floor(angle / 360.0));
	vec4 tex = texture2D(tDiffuse, v_uv);
	vec2 px = v_uv * u_resolution;
	float yIntercept = getYIntercept();
	float _angle = radians(angle + 90.0);
	float posIndicator = v_uv.y - tan(_angle) * v_uv.x;
	float distance = abs(-tan(_angle) * px.x + px.y - yIntercept * u_resolution.y) / sqrt(pow(tan(_angle), 2.0) + 1.0);

	if (degree == 0.0 || degree == 360.0) {
		if (v_uv.x < 1.0 - progress) {
			tex = vec4(0.0, 0.0, 0.0, 0.0);
		}
	} else if (degree == 90.0) {
		if (v_uv.y < progress) {
			tex = vec4(0.0, 0.0, 0.0, 0.0);
		}
	} else if (degree == 180.0) {
		if (v_uv.x > progress) {
			tex = vec4(0.0, 0.0, 0.0, 0.0);
		}
	} else if (degree == 270.0) {
		if (v_uv.y > 1.0 - progress) {
			tex = vec4(0.0, 0.0, 0.0, 0.0);
		}
	} else if (degree < 180.0) {
		if (posIndicator < yIntercept) {
			tex = vec4(0.0, 0.0, 0.0, 0.0);
		}
	} else if (degree > 180.0) {
		if (posIndicator > yIntercept) {
			tex = vec4(0.0, 0.0, 0.0, 0.0);
		}
	}

	gl_FragColor = vec4(tex);
}
`

export function LinearTransitionShader(property: LinearTransitionProperty) {
	const degree = (property.angle || 0) % 360;
	
	const uniforms = {
		// transition angle in degree
		angle: { value: degree },
		// transition progress starting from 0 to 1
		progress: { value: property.progress || 0 },
		// feather radius
		feather: { value: property.feather || 0 },
		tDiffuse: { value: null },
	}
	
	return {
		uniforms,
		vertexShader,
		fragmentShader,
	}
}