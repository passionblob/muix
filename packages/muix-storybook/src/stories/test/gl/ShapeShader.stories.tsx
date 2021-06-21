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
	.add("ShapeShader", () => <SimpleGLStory />);

const uniforms = {
	u_time: { value: 0.0 },
	u_mouse: { value: { x: 0.0, y: 0.0 } },
	u_resolution: { value: { x: 0, y: 0 } },
	u_color: { value: new THREE.Color(WebColors.FireBrick) }
}

const vertexShader = `
varying vec3 v_position;

void main() {
	v_position = position;
	gl_Position = projectionMatrix * modelViewMatrix  * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform vec2 u_resolution;

varying vec3 v_position;

int rectCount = 0;
const int rectMaxCount = 10;
vec3 rects[rectMaxCount];

void drawRect(vec2 center, vec2 size, vec3 color) {
	if (rectCount >= rectMaxCount) return;

	float isInRect = 1.0;

	float minX = center.x - size.x / 2.0;
	float maxX = center.x + size.x / 2.0;
	float minY = center.y - size.y / 2.0;
	float maxY = center.y + size.y / 2.0;

	if (v_position.x < minX || v_position.x > maxX) {
		isInRect = 0.0;
	}

	if (v_position.y < minY || v_position.y > maxY) {
		isInRect = 0.0;
	}

	rects[rectCount] = color * isInRect;
	rectCount += 1;
}

void main() {
	for (int i = 0; i < rectMaxCount; i += 1) {
		float x = -0.5 + float(i) * 0.1;
		float r = 0.5 + float(i) * 0.05;
		float g = 0.0 + float(i) * 0.05;
		float b = 0.5 + float(i) * 0.05;
		drawRect(
			vec2(x, 0.0),
			vec2(0.1, 1.0),
			vec3(r, g, b)
		);
	}

	vec3 color;

	for (int i = 0; i < rects.length; i += 1) {
		color += rects[i];
	}
	gl_FragColor = vec4(color, 1.0);
	rectCount = 0;
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
		camera.position.z = 2;


		const size = 2;
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
