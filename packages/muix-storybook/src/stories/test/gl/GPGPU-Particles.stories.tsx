import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource, NativeTouchEvent, GestureResponderEvent, LayoutRectangle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { CustomAfterimagePass } from './CustomAfterimagePass';

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
	const layout = React.useRef<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });
	const touchInfo = React.useRef({x: 0, y: 0, timestamp: 0});
	const startIndex = React.useRef(0);
	const endIndex = React.useRef(0);

	function incrementIndex(indexRef: {current: number}) {
		indexRef.current += PARTICLE_PER_EMIT;
		indexRef.current %= PARTICLE_MAX_COUNT;
	}

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferHeight: height, drawingBufferWidth: width } = gl
		// gl.enable(gl.BLEND);
		// gl.blendEquation(gl.ONE_MINUS_SRC_ALPHA);

		const renderer = new Renderer({ gl });
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.set(0, 0, 10);

		const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
		
		const dtTouch = gpuCompute.createTexture();
		const dtPosition = gpuCompute.createTexture();
		const dtProgress = gpuCompute.createTexture();
		const dtColor = gpuCompute.createTexture();
		const dtSelect = gpuCompute.createTexture();
		const dtToggle = gpuCompute.createTexture();
		const dtComplete = gpuCompute.createTexture();

		const touchShader = `
		uniform vec2 touch;

		vec2 normalizeTouch(vec2 _touch) {
			vec2 result = touch;
			result.y *= 2.0;
			result.y -= 1.0;
			result.y *= -1.0;
			result.y += 1.0;
			result.y /= 2.0;

			return result;
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			bool selected = texture(textureSelect, uv).x >= 1.0;
			vec2 prev = texture(textureTouch, uv).xy;
			vec2 next = prev;

			if (selected && !toggled) {
				next = normalizeTouch(touch);
			}

			gl_FragColor = vec4(next, 0.0, 1.0);
		}
		`;

		const positionShader = `
		const float dt = 0.016;

		float easeOutCubic(float x) {
			return 1.0 - pow(1.0 - x, 3.0);
		}

		float random(vec2 st) {
			return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			vec2 touch = texture(textureTouch, uv).xy;
			vec2 prev = texture(texturePosition, uv).xy;
			vec2 next = prev;
			vec2 destination = (vec2(random(uv), random(uv + touch)) * 2.0 - 1.0);
			float distanceFactor = 0.1;

			next.xy = touch
				+	easeOutCubic(progress)
				* destination
				* distanceFactor;

			gl_FragColor = vec4(next, 0.0, 1.0);
		}
		`;

		const selectShader = `
		uniform float startIndex;
		uniform float endIndex;

		float isSelected() {
			float result = 0.0;
			float index = resolution.x * gl_FragCoord.y + gl_FragCoord.x - resolution.x / 2.0;

			if (startIndex < endIndex) {
				if (index >= startIndex && index < endIndex) {
					result = 1.0;
				}
			} else {
				if (index >= startIndex || index < endIndex) {
					result = 1.0;
				}
			}

			if (floor(startIndex) == floor(endIndex)) {
				result = 0.0;
			}

			return result;
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float next = isSelected();

			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}
		`;

		const toggleShader = `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			bool selected = texture(textureSelect, uv).x >= 1.0;
			bool completed = texture(textureComplete, uv).x >= 1.0;
			float prev = texture(textureToggle, uv).x;
			float next = prev;

			if (selected && !completed) {
				next = 1.0;
			}

			if (completed) {
				next = 0.0;
			}
			
			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}
		`;

		const completeShader = `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			bool selected = texture(textureSelect, uv).x >= 1.0;
			float prev = texture(textureComplete, uv).x;
			float next = prev;

			if (toggled && progress >= 1.0) {
				next = 1.0;
			}

			if (!selected && prev >= 1.0) {
				next = 0.0;
			}
			
			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}
		`;

		const progressShader = `
		const float duration = 1000.0;
		const float dt = 0.016;

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			bool completed = texture(textureComplete, uv).x >= 1.0;
			float prev = texture(textureProgress, uv).x;
			float next = prev;
			
			if (toggled) {
				next += dt * (1000.0 / duration);
			}

			if (completed) {
				next = 0.0;
			}

			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}		
		`;

		const colorShader = `
		const float dt = 0.016;

		float easeOutCubic(float x) {
			return 1.0 - pow(1.0 - x, 3.0);
		}

		float random(vec2 st) {
			return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			bool completed = texture(textureComplete, uv).x >= 1.0;
			vec3 prev = texture(textureColor, uv).xyz;
			vec3 next = prev;

			float alpha;
			if (!completed) {
				alpha = 1.0 - (1.0 - easeOutCubic(progress));
			} else {
				alpha = 0.0;
			}

			vec3 color = vec3(random(uv), random(uv + 0.1), random(uv + 0.2));

			gl_FragColor = vec4(color, alpha);
		}
		`;

		const touchVariable = gpuCompute.addVariable("textureTouch", touchShader, dtTouch);
		const positionVariable = gpuCompute.addVariable("texturePosition", positionShader, dtPosition);
		const progressVariable = gpuCompute.addVariable("textureProgress", progressShader, dtProgress);
		const selectVariable = gpuCompute.addVariable("textureSelect", selectShader, dtSelect);
		const toggleVariable = gpuCompute.addVariable("textureToggle", toggleShader, dtToggle);
		const completeVariable = gpuCompute.addVariable("textureComplete", completeShader, dtComplete);
		const colorVariable = gpuCompute.addVariable("textureColor", colorShader, dtColor);
		gpuCompute.setVariableDependencies(positionVariable, [positionVariable, progressVariable, touchVariable]);
		gpuCompute.setVariableDependencies(progressVariable, [progressVariable, toggleVariable, completeVariable]);
		gpuCompute.setVariableDependencies(selectVariable, [selectVariable]);
		gpuCompute.setVariableDependencies(toggleVariable, [selectVariable, progressVariable, toggleVariable, completeVariable]);
		gpuCompute.setVariableDependencies(completeVariable, [completeVariable, toggleVariable, progressVariable, selectVariable]);
		gpuCompute.setVariableDependencies(colorVariable, [colorVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(touchVariable, [toggleVariable, selectVariable, touchVariable]);
		gpuCompute.init();
		
		const positionFBO = gpuCompute.getCurrentRenderTarget(positionVariable) as THREE.WebGLRenderTarget;
		const progressFBO = gpuCompute.getCurrentRenderTarget(progressVariable) as THREE.WebGLRenderTarget;
		const colorFBO = gpuCompute.getCurrentRenderTarget(colorVariable) as THREE.WebGLRenderTarget;
		const selectFBO = gpuCompute.getCurrentRenderTarget(selectVariable) as THREE.WebGLRenderTarget;
		const toggleFBO = gpuCompute.getCurrentRenderTarget(toggleVariable) as THREE.WebGLRenderTarget;
		const completeFBO = gpuCompute.getCurrentRenderTarget(completeVariable) as THREE.WebGLRenderTarget;
		const touchFBO = gpuCompute.getCurrentRenderTarget(touchVariable) as THREE.WebGLRenderTarget;

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
		const progressPass = new TexturePass(progressFBO.texture);
		const selectPass = new TexturePass(selectFBO.texture);
		const togglePass = new TexturePass(toggleFBO.texture);
		const completePass = new TexturePass(completeFBO.texture);
		const afterImagePass = new CustomAfterimagePass();

		composer.addPass(renderPass);
		// composer.addPass(afterImagePass);
		// composer.addPass(progressPass);
		// composer.addPass(positionPass);
		// composer.addPass(selectPass);
		// composer.addPass(togglePass);
		// composer.addPass(completePass);

		let shouldStop = false;
		animation.current.stop = () => {shouldStop = true};

		function tick(time: number) {
			if (shouldStop) return;

			const {x, y, timestamp} = touchInfo.current
			Object.assign(positionVariable.material.uniforms, {
				touch: {value: {
					x: x / layout.current.width,
					y: y / layout.current.height,
				}},
			})

			Object.assign(progressVariable.material.uniforms, {
				timestamp: {value: timestamp},
				time: {value: time},
				startIndex: {value: startIndex.current},
				endIndex: {value: endIndex.current},
			})

			Object.assign(selectVariable.material.uniforms, {
				startIndex: {value: startIndex.current},
				endIndex: {value: endIndex.current},
			})

			Object.assign(touchVariable.material.uniforms, {
				touch: {value: {
					x: x / layout.current.width,
					y: y / layout.current.height,
				}},
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

			if (startIndex.current == endIndex.current) {
				incrementIndex(endIndex);
			} else {
				incrementIndex(startIndex);
				incrementIndex(endIndex);
			}
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