import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { Asset } from "expo-asset"
import WebColors from '@monthem/web-color';

const tex1 = require("./tex1.jpg")

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("RippleShader", () => <SimpleGLStory />);

const uniforms = {
	u_time: { value: 0.0 },
	u_mouse: { value: { x: 0.0, y: 0.0 } },
	u_duration: {value: 2.0 },
	u_resolution: { value: { x: 0, y: 0 } },
	u_color: { value: new THREE.Color(WebColors.FireBrick) },
	u_tex: { value: new TextureLoader().load(tex1) }
}

const vertexShader = `\
varying vec3 v_position;
varying vec2 v_uv;

void main() {
	v_position = position;
	v_uv = uv;
	gl_Position = projectionMatrix * modelViewMatrix  * vec4(position, 1.0);
}
`
const fragmentShader = `
#define PI 3.141592653589

uniform float u_duration;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
varying vec2 v_uv;
varying vec3 v_position;

vec2 rotate(vec2 pt, float theta, float aspect) {
	float c = cos(theta);
	float s = sin(theta);
	mat2 mat = mat2(c, s, -s, c);
	pt.y /= aspect;
	pt = mat * pt;
	pt.y *= aspect;
	return pt;
}

float inRect(vec2 pt, vec2 bottomLeft, vec2 topRight) {
	vec2 s = step(bottomLeft, pt) - step(topRight, pt);
	return s.x * s.y;
}

void main() {
	vec2 p = v_position.xy;
	float len = length(p);
	vec2 ripple = v_uv + p / len * 0.03 * cos(len * 20.0 - u_time * 20.0);
	float delta = (sin(mod(u_time, u_duration) * (2.0 * PI / u_duration)) + 1.0) / 2.0;
	vec2 uv = mix(ripple, v_uv, delta);
	vec3 color = texture2D(u_tex, uv).rgb;

	gl_FragColor = vec4(color, 1.0);
}
`

const SimpleGLStory = () => {

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderMove: (e) => {
			const { locationX, locationY } = e.nativeEvent;
			uniforms.u_mouse.value.x = locationX;
			uniforms.u_mouse.value.y = locationY;
		}
	})

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferHeight: height, drawingBufferWidth: width } = gl

		uniforms.u_resolution.value.x = width;
		uniforms.u_resolution.value.y = height;

		const renderer = new Renderer({ gl });
		renderer.setClearColor(WebColors.YellowGreen);
		const scene = new THREE.Scene();

		const clock = new THREE.Clock();

		const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000)
		// camera.position.z = 0.8697;
		camera.position.z = 2;

		const planeWidth = 2
		const aspectRatio = 4 / 3
		const planeHeight = planeWidth / aspectRatio
		const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			// transparent: true,
		})

		const mesh = new THREE.Mesh(geometry, material)

		scene.add(mesh)

		function letThereBeLight() {
			const color = 0xFFFFFF;
			const intensity = 1;
			const light = new THREE.PointLight(color, intensity);
			light.position.set(0, 0, 0)
			scene.add(light)
		}

		function render(time: number) {
			uniforms.u_time.value = clock.getElapsedTime()
			renderer.render(scene, camera);
			gl.endFrameEXP();

			requestAnimationFrame(render)
		}

		letThereBeLight()
		requestAnimationFrame(render)
	}

	return (
		<ScrollView>
			<GLView
				{...panResponder.panHandlers}
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: 3 / 4,
				}}
				onContextCreate={onContextCreate}
			/>
		</ScrollView>
	)
}
