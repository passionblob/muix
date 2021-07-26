import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer"
import ViewShot from "react-native-view-shot"
import WebColors from '@monthem/web-color'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { PlaneGeometry, ShaderMaterial } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { Responsive } from '@monthem/muix/src';

storiesOf("Test/WebGL", module)
	.add("GPGPU-Test", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const SimpleGLStory = () => {
	const animation = React.useRef({ stop() { } });
	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferHeight: height, drawingBufferWidth: width } = gl

		const renderer = new Renderer({ gl });
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.set(0, 0, 10);

		const WIDTH = 50;

		const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
		const dtPosition = gpuCompute.createTexture();
		const dtVelocity = gpuCompute.createTexture();
		const dtDirection = gpuCompute.createTexture();
		const dtAcc = gpuCompute.createTexture();
		fillPositionTexture(dtPosition);
		fillVelocityTexture(dtVelocity);
		fillDirectionTexture(dtDirection);
		fillAccTexture(dtAcc);

		const fragmentShaderPosition = `
		const float dt = 0.016;
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec2 position = texture2D(texturePosition, uv).xy;
			vec2 velocity = texture2D(textureVelocity, uv).xy;
			vec2 direction = texture2D(textureDirection, uv).xy;
			
			gl_FragColor = vec4(
				position +
					velocity
						* (direction * 2.0 - 1.0)
						* dt
				,
				1.0,
				1.0
			);
		}
		`;

		const fragmentShaderVelocity = `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec2 velocity = texture2D(textureVelocity, uv).xy;
			vec2 acc = texture2D(textureAcc, uv).xy;
			vec2 direction = texture2D(textureDirection, uv).xy;

			vec2 newVelocity = velocity + 0.1 * acc;			
			
			if (direction.x <= 0.0 || direction.x >= 1.0) {
				newVelocity.x = 0.0;
			} else if (direction.y <= 0.0 || direction.y >= 1.0) {
				newVelocity.y = 0.0;
			}
			
			gl_FragColor = vec4(newVelocity, 1.0, 1.0);
		}
		`;

		const fragmentShaderDirection = `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec2 position = texture2D(texturePosition, uv).xy;
			vec2 direction = texture2D(textureDirection, uv).xy;

			if (position.x <= 0.0 && direction.x <= 1.0) {
				direction.x = 1.0;
			} else if (position.x >= 1.0 && direction.x >= 0.0) {
				direction.x = 0.0;
			}

			if (position.y <= 0.0 && direction.y <= 1.0) {
				direction.y = 1.0;
			} else if (position.y >= 1.0 && direction.y >= 0.0) {
				direction.y = 0.0;
			}

			gl_FragColor = vec4(direction, 1.0, 1.0);
		}
		`;

		const fragmentShaderAcc = `
		uniform float time;

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec2 acc = texture2D(textureAcc, uv).xy;

			gl_FragColor = vec4(acc, 1.0, 1.0);
		}
		`;

		const positionVariable = gpuCompute.addVariable("texturePosition", fragmentShaderPosition, dtPosition)
		const velocityVariable = gpuCompute.addVariable("textureVelocity", fragmentShaderVelocity, dtVelocity)
		const directionVariable = gpuCompute.addVariable("textureDirection", fragmentShaderDirection, dtDirection)
		const accVariable = gpuCompute.addVariable("textureAcc", fragmentShaderAcc, dtAcc)

		gpuCompute.setVariableDependencies(positionVariable, [positionVariable, directionVariable, velocityVariable]);
		gpuCompute.setVariableDependencies(velocityVariable, [velocityVariable, accVariable, directionVariable]);
		gpuCompute.setVariableDependencies(directionVariable, [positionVariable, directionVariable]);
		gpuCompute.setVariableDependencies(accVariable, [accVariable]);

		positionVariable.wrapS = THREE.RepeatWrapping;
		positionVariable.wrapT = THREE.RepeatWrapping;
		positionVariable.magFilter = THREE.NearestFilter;
		positionVariable.minFilter = THREE.NearestFilter;
		velocityVariable.wrapS = THREE.RepeatWrapping;
		velocityVariable.wrapT = THREE.RepeatWrapping;
		directionVariable.wrapS = THREE.RepeatWrapping;
		directionVariable.wrapT = THREE.RepeatWrapping;

		const error = gpuCompute.init();
		if (error) console.error(error);

		const positionRenderTarget = gpuCompute.getCurrentRenderTarget(positionVariable) as THREE.WebGLRenderTarget;

		const COUNT = WIDTH * WIDTH;
		const circleGeometry = new THREE.CircleGeometry(0.01);
		const circlePositionBuffer = Array.from(circleGeometry.getAttribute("position").array);
		const circleGeometryVertexCount = circlePositionBuffer.length / 3;
		const circleGeometryIndice = circleGeometry.index as THREE.BufferAttribute;

		const indice: number[] = [];
		const positionBuffer: number[] = [];
		const referenceBuffer: number[] = [];

		for (let i = 0; i < COUNT; i += 1) {
			const randomness = 0.9;
			const scale = (1 - randomness) + Math.random() * randomness;
			positionBuffer.push(...circlePositionBuffer.map((val) => val * scale))
			for (let j = 0; j < circleGeometryIndice.array.length; j += 1) {
				const index = circleGeometryIndice.array[j];
				indice.push(i * circleGeometryVertexCount + index);
			}

			for (let j = 0; j < circleGeometryVertexCount; j += 1) {
				const x = (i % WIDTH) / WIDTH;
				const y = Math.floor(i / WIDTH) / WIDTH;
				referenceBuffer.push(x, y);
			}
		}

		const myGeometry = new THREE.BufferGeometry();
		myGeometry.setIndex(indice);
		myGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positionBuffer, 3));
		myGeometry.setAttribute("reference", new THREE.Float32BufferAttribute(referenceBuffer, 2));

		const myMaterial = new THREE.ShaderMaterial({
			uniforms: {
				texturePosition: { value: positionRenderTarget.texture }
			},
			vertexShader: `
			uniform sampler2D texturePosition;
			attribute vec2 reference;

			void main() {
				vec2 translate = texture(texturePosition, reference).xy * 2.0 - 1.0;
				vec2 newPosition = position.xy + translate;
				gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 0.0, 1.0);
			}
			`,
			fragmentShader: `
			void main() {
				gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
			}
			`,
		})

		const myMesh = new THREE.Mesh(myGeometry, myMaterial);
		scene.add(myMesh);

		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene, camera);
		const positionPass = new TexturePass(positionRenderTarget.texture);

		composer.addPass(renderPass);
		// composer.addPass(positionPass);

		let shouldStop = false;
		animation.current.stop = () => { shouldStop = true };

		function tick(time: number) {
			accVariable.material.uniforms["time"] = { value: time }

			if (shouldStop) return;
			gpuCompute.compute();
			composer.render();
			gl.endFrameEXP();
			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	React.useEffect(() => {
		return () => {
			animation.current.stop();
		}
	}, [])

	return (
		<ScrollView>
			<GLView
				msaaSamples={4}
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: 1 / 1,
					backgroundColor: "black",
				}}
				onContextCreate={onContextCreate}
			/>
			<Text
				style={{
					color: "white",
					backgroundColor: "black",
					fontSize: 20,
					padding: 10,
					marginTop: 10
				}}>
				2,500 particles bumping up and down.
			</Text>
		</ScrollView>
	)
}


function fillPositionTexture(texture: THREE.Texture) {
	const array = texture.image.data;
	for (let i = 0; i < array.length; i += 4) {
		array[i + 0] = Math.random();
		array[i + 1] = Math.random();
		array[i + 2] = 0;
		array[i + 3] = 1;
	}
}

function fillVelocityTexture(texture: THREE.Texture) {
	const array = texture.image.data;
	for (let i = 0; i < array.length; i += 4) {
		array[i + 0] = 0.2 + Math.random() * 0.8;
		array[i + 1] = 0.2 + Math.random() * 0.8;
		array[i + 2] = 1;
		array[i + 3] = 1;
	}
}

function fillDirectionTexture(texture: THREE.Texture) {
	const array = texture.image.data;
	for (let i = 0; i < array.length; i += 4) {
		array[i + 0] = 1;
		array[i + 1] = 1;
		array[i + 2] = 1;
		array[i + 3] = 1;
	}
}

function fillAccTexture(texture: THREE.Texture) {
	const array = texture.image.data;
	for (let i = 0; i < array.length; i += 4) {
		array[i + 0] = 0.5;
		array[i + 0] = 0.5;
		array[i + 0] = 0.5;
		array[i + 0] = 1;
	}
}