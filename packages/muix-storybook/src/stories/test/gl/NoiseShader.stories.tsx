import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { Asset } from "expo-asset"
import WebColors from '@monthem/web-color';

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("NoiseShader", () => <SimpleGLStory />);

const uniforms = {
	u_time: { value: 0.0 },
	u_mouse: { value: { x: 0.0, y: 0.0 } },
	u_resolution: { value: { x: 0, y: 0 } },
	u_color: { value: new THREE.Color(WebColors.FireBrick) }
}

const vertexShader = `\
varying vec3 v_position;

void main() {
	v_position = position;
	gl_Position = projectionMatrix * modelViewMatrix  * vec4(position, 1.0);
}
`
const fragmentShader = `
uniform vec2 u_resolution;
uniform float u_time;

varying vec3 v_position;

float random(vec2 st, float seed) {
	float a = 12.9898;
	float b = 78.233;
	float c = 43758.5453123;
	vec2 multiplier = vec2(a, b);
	return fract(sin(dot(st, multiplier) + seed) * c);
}

void main() {
	vec3 color = random(vec2(v_position), u_time) * vec3(1.0, 1.0, 1.0);
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


		const size = 2;
		// const planeWidth = 1
		// const aspectRatio = 3 / 4
		// const planeHeight = planeWidth / aspectRatio
		const geometry = new THREE.PlaneGeometry(size, size);

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
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
