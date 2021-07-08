import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import ViewShot from "react-native-view-shot"
import WebColors from '@monthem/web-color'

storiesOf("Test/WebGL", module)
	.add("GPGPU-birds", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const SimpleGLStory = () => {
	const uniforms = {
		u_resolution: { value: { x: 0, y: 0 } },
		u_aspectRatio: { value: 1 },
	}

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferHeight: height, drawingBufferWidth: width } = gl
		uniforms.u_resolution.value.x = width;
		uniforms.u_resolution.value.y = height;
		uniforms.u_aspectRatio.value = width / height;

		const renderer = new Renderer({ gl });
		renderer.setClearColor(WebColors.YellowGreen);
		const scene = new THREE.Scene();

		const zoom = 1.0;

		const camera = new THREE.OrthographicCamera(
			-1 / zoom,
			1 / zoom,
			1 / zoom,
			-1 / zoom,
			0.1,
			100
		);
		camera.position.z = 10;
		scene.add(camera)

		const geometrySize = 2;

		const geometry = new THREE.PlaneGeometry(geometrySize, geometrySize);
		geometry.morphAttributes
		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: `
			varying vec2 v_uv;

			void main() {
				v_uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
			`,
			fragmentShader: `
			uniform sampler2D u_image;
			uniform vec2 u_img_size;
			uniform vec2 u_resolution;

			varying vec2 v_uv;

			void main() {
				vec2 uv = v_uv;
				vec4 color = texture2D(u_image, uv);
				gl_FragColor = color;
			}
			`,
			transparent: true,
		})

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		renderer.render(scene, camera);
		gl.endFrameEXP();
	}

	return (
		<ScrollView>
			<GLView
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: 1 / 1,
				}}
				onContextCreate={onContextCreate}
			/>
		</ScrollView>
	)
}
