import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource, NativeTouchEvent, GestureResponderEvent, LayoutRectangle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';

storiesOf("Test/WebGL", module)
	.add("GPGPU-Particles", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

// GPGPU texture size
const WIDTH = 32;

const PARTICLE_MAX_COUNT = WIDTH * WIDTH;

const PARTICLE_PER_EMIT = WIDTH;

const SimpleGLStory = () => {
	const animation = React.useRef({stop() {}});
	const layout = React.useRef<LayoutRectangle>({
		x: 0, y: 0, width: 0, height: 0
	})
	const touchInfo = React.useRef({
		x: 0,
		y: 0,
		timestamp: 0,
	});
	const startIndex = React.useRef(0);
	const endIndex = React.useRef(0);

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferHeight: height, drawingBufferWidth: width } = gl
		// gl.enable(gl.BLEND);
		// gl.blendEquation(gl.ONE_MINUS_SRC_ALPHA);

		const renderer = new Renderer({ gl });
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.set(0, 0, 10);

		const gpuCompute = new GPUComputationRenderer(16, 16, renderer);
		
		const dtPosition = gpuCompute.createTexture();
		const dtProgress = gpuCompute.createTexture();
		const dtColor = gpuCompute.createTexture();

		const positionShader = `
		uniform vec2 touch;
		const float dt = 0.016;

		float easeOutCubic(float x) {
			return 1.0 - pow(1.0 - x, 3.0);
		}

		vec2 normalizeTouch(vec2 _touch) {
			vec2 result = touch;
			result.y *= 2.0;
			result.y -= 1.0;
			result.y *= -1.0;
			result.y += 1.0;
			result.y /= 2.0;

			return result;
		}

		float random(vec2 st) {
			return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			vec3 prev = texture(texturePosition, uv).xyz;
			vec3 next = prev;

			vec2 normalizedTouch = normalizeTouch(touch);

			next.xy = normalizedTouch
				+	easeOutCubic(progress)
				* normalize(uv * 2.0 - 1.0)
				* 0.2
				* (0.3 + 0.7 * random(uv + touch));

			gl_FragColor = vec4(next, 1.0);
		}
		`;

		const progressShader = `
		const float count = ${PARTICLE_MAX_COUNT}.0;

		uniform float timestamp;
		uniform float time;
		uniform float startIndex;
		uniform float endIndex;

		const float duration = 1000.0;
		const float dt = 0.016;

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float index = resolution.x * gl_FragCoord.x + gl_FragCoord.y;
			vec3 prev = texture(textureProgress, uv).xyz;
			vec3 next = prev;

			float progress = min((time - timestamp) / duration, 1.0);

			gl_FragColor = vec4(progress, 0.0, 0.0, 1.0);
		}		
		`;

		const colorShader = `
		const float dt = 0.016;

		float easeOutCubic(float x) {
			return 1.0 - pow(1.0 - x, 3.0);
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			vec3 prev = texture(textureColor, uv).xyz;
			vec3 next = prev;

			float alpha = 1.0 - easeOutCubic(progress);

			gl_FragColor = vec4(1.0, 0.0, 0.0, alpha);
		}
		`;


		const positionVariable = gpuCompute.addVariable("texturePosition", positionShader, dtPosition);
		const progressVariable = gpuCompute.addVariable("textureProgress", progressShader, dtProgress);
		const colorVariable = gpuCompute.addVariable("textureColor", colorShader, dtColor);
		gpuCompute.setVariableDependencies(positionVariable, [positionVariable, progressVariable]);
		gpuCompute.setVariableDependencies(progressVariable, [progressVariable]);
		gpuCompute.setVariableDependencies(colorVariable, [colorVariable, progressVariable]);
		
		gpuCompute.init();
		
		const positionFBO = gpuCompute.getCurrentRenderTarget(positionVariable) as THREE.WebGLRenderTarget;
		const progressFBO = gpuCompute.getCurrentRenderTarget(progressVariable) as THREE.WebGLRenderTarget;
		const colorFBO = gpuCompute.getCurrentRenderTarget(colorVariable) as THREE.WebGLRenderTarget;

		const circleGeometry = new THREE.CircleGeometry(0.05);
		const circlePositionBuffer = Array.from(circleGeometry.getAttribute("position").array);
		const circleVertexCount = circlePositionBuffer.length / 3;
		const circleIndice = circleGeometry.index as THREE.BufferAttribute;

		const indice = [];
		const positionBuffer = [];
		const referenceBuffer = [];

		for (let i = 0; i < PARTICLE_MAX_COUNT; i += 1) {
			const random = Math.random();

			positionBuffer.push(...circlePositionBuffer.map((val) => val * random));

			for (let j = 0; j < circleIndice.array.length; j += 1) {
				const index = circleIndice.array[j];
				indice.push(circleVertexCount * i + index);
			}

			for (let j = 0; j < circleVertexCount; j += 1) {
				const x = (i % WIDTH) / WIDTH;
				const y = Math.floor(i / WIDTH) / WIDTH;
				referenceBuffer.push(x, y);
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setIndex(indice);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(positionBuffer, 3));
		geometry.setAttribute("reference", new THREE.Float32BufferAttribute(referenceBuffer, 2));

		const material = new THREE.ShaderMaterial({
			uniforms: {
				texturePosition: {value: positionFBO.texture},
				textureColor: {value: colorFBO.texture},
				textureProgress: {value: progressFBO.texture},
			},
			vertexShader: `
			uniform sampler2D texturePosition;
			uniform sampler2D textureProgress;
			attribute vec2 reference;
			varying vec2 vReference;

			void main() {
				vReference = reference;
				float progress = texture(textureProgress, reference).x;
				vec2 translate = texture(texturePosition, reference).xy * 2.0 - 1.0;
				float scale = 1.0 - progress;

				vec2 tmpPos = position.xy;
				tmpPos.xy *= scale;

				vec2 newPos = tmpPos.xy + translate;

				gl_Position = projectionMatrix * viewMatrix * vec4(newPos, 0.0, 1.0);
			}
			`,
			fragmentShader: `
			uniform sampler2D textureColor;			
			varying vec2 vReference;

			void main() {
				vec4 color = texture(textureColor, vReference);
				

				gl_FragColor = color;
			}
			`,
			transparent: true
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene, camera);
		const positionPass = new TexturePass(positionFBO.texture);

		composer.addPass(renderPass);
		// composer.addPass(positionPass);

		let shouldStop = false;
		animation.current.stop = () => {shouldStop = true};

		function tick(time: number) {
			if (shouldStop) return;

			const {x, y, timestamp} = touchInfo.current
			Object.assign(positionVariable.material.uniforms, {
				time: {value: time},
				touch: {value: {
					x: x / layout.current.width,
					y: y / layout.current.height,
				}},
			})

			Object.assign(progressVariable.material.uniforms, {
				timestamp: {value: timestamp},
				startIndex: {value: startIndex},
				endIndex: {value: endIndex},
				time: {value: time}
			})

			gpuCompute.compute();
			composer.render();
			gl.endFrameEXP();
			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderStart: (e) => {
			const {locationX, locationY, timestamp} = e.nativeEvent;

			touchInfo.current = {
				x: locationX,
				y: locationY,
				timestamp,
			}

			startIndex.current += PARTICLE_PER_EMIT;
			endIndex.current += PARTICLE_PER_EMIT;
			startIndex.current %= PARTICLE_MAX_COUNT;
			endIndex.current %= PARTICLE_MAX_COUNT;
		},
	})

	React.useEffect(() => {
		return () => {
			animation.current.stop();
		}
	}, []);

	return (
		<ScrollView>
			<GLView
				onLayout={(e) => {layout.current = e.nativeEvent.layout}}
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: 1 / 1,
					backgroundColor: "black",
				}}
				{...panResponder.panHandlers}
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
				touch area to generate particles.
			</Text>
		</ScrollView>
	)
}