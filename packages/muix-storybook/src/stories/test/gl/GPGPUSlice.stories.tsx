import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource, NativeTouchEvent, GestureResponderEvent, LayoutRectangle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { CustomAfterimagePass } from './CustomAfterimagePass';
import {GPGPUParticle} from "./GPGPUParticle"
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

storiesOf("Test/WebGL", module)
	.add("GPGPU-Slice", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const SIZE = 32;
const PARTICLE_MAX_COUNT = SIZE * SIZE;
const ASPECT_RATIO = 3 / 4;
const ROW_COUNT = Math.floor(SIZE / Math.sqrt(ASPECT_RATIO));
const COLUMN_COUNT = Math.floor(ROW_COUNT * ASPECT_RATIO);

const SimpleGLStory = () => {
	const animation = React.useRef({stop() {}});
	const layout = React.useRef<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });
	const touch = React.useRef({
		x: -100,
		y: -100,
	}).current;

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({gl});
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.set(0, 0, 10);
		
		const gpuCompute = new GPUComputationRenderer(SIZE, SIZE, renderer);
		
		const dtPosition = gpuCompute.createTexture();
		const dtProgress = gpuCompute.createTexture();
		const dtSelect = gpuCompute.createTexture();
		const dtToggle = gpuCompute.createTexture();
		const dtComplete = gpuCompute.createTexture();
		const dtColor = gpuCompute.createTexture();

		const selectShader = `
		uniform vec2 touch;

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float prev = texture(textureSelect, uv).x;
			float next = prev;
			
			float d = distance(touch, uv);

			if (d < 0.05) {
				next = 1.0;
			} else {
				next = 0.0;
			}

			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}
		`;

		const toggleShader = `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
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
		uniform bool shouldRecover;

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			bool selected = texture(textureSelect, uv).x >= 1.0;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			float progress = texture(textureProgress, uv).x;
			float prev = texture(textureComplete, uv).x;
			float next = prev;

			if (toggled && progress >= 1.0) {
				next = 1.0;
			} else if (prev >= 1.0 && !selected && shouldRecover) {
				next = 0.0;
			}

			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}
		`;

		const progressShader = `
		uniform float duration;
		const float dt = 0.01666666;

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			bool completed = texture(textureComplete, uv).x >= 1.0;
			float prev = texture(textureProgress, uv).x;
			float next = prev;

			if (toggled) {
				next += dt * (1000.0/duration);
			} else if (!completed) {
				next = 0.0;
			}

			gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
		}
		`;

		const positionShader = `
		float random(vec2 st) {
			return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43257.5453123);
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float index = resolution.x * gl_FragCoord.y + gl_FragCoord.x;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			float progress = texture(textureProgress, uv).x;

			vec3 prev = texture(texturePosition, uv).xyz;
			vec3 next = prev;

			if (toggled) {
				next.x += (0.1 + 0.5 * random(uv)) * 0.01;
				next.y += (0.1 + 0.5 * random(uv)) * 0.01;
				next.z = 1.0 - 0.01;
			} else {
				next = vec3(0.0);
			}

			gl_FragColor = vec4(next, 0.0);
		}
		`;

		const colorShader = `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			bool completed = texture(textureComplete, uv).x >= 1.0;
			float progress = texture(textureProgress, uv).x;
			vec4 prev = texture(textureColor, uv);
			vec4 next = prev;

			next.rgb = vec3(progress);
			
			if (!completed) {
				next.a = 1.0;
			} else {
				next.a = 0.0;
			}

			gl_FragColor = next;
		}
		`;

		const selectVariable = gpuCompute.addVariable("textureSelect", selectShader, dtSelect);
		const toggleVariable = gpuCompute.addVariable("textureToggle", toggleShader, dtToggle);
		const progressVariable = gpuCompute.addVariable("textureProgress", progressShader, dtProgress);
		const colorVariable = gpuCompute.addVariable("textureColor", colorShader, dtColor);
		const positionVariable = gpuCompute.addVariable("texturePosition", positionShader, dtPosition);
		const completeVariable = gpuCompute.addVariable("textureComplete", completeShader, dtComplete);

		gpuCompute.setVariableDependencies(selectVariable, [selectVariable]);
		gpuCompute.setVariableDependencies(toggleVariable, [selectVariable, toggleVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(progressVariable, [toggleVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(completeVariable, [completeVariable, toggleVariable, selectVariable, progressVariable]);
		gpuCompute.setVariableDependencies(positionVariable, [positionVariable, progressVariable, toggleVariable]);
		gpuCompute.setVariableDependencies(colorVariable, [colorVariable, progressVariable, completeVariable]);

		Object.assign(selectVariable.material.uniforms, {
			touch: {value: touch},
		})

		Object.assign(completeVariable.material.uniforms, {
			shouldRecover: {value: false},
		})

		Object.assign(progressVariable.material.uniforms, {
			duration: {value: 3000}
		})

		gpuCompute.init();

		const selectFBO = gpuCompute.getCurrentRenderTarget(selectVariable) as THREE.WebGLRenderTarget;
		const toggleFBO = gpuCompute.getCurrentRenderTarget(toggleVariable) as THREE.WebGLRenderTarget;
		const progressFBO = gpuCompute.getCurrentRenderTarget(progressVariable) as THREE.WebGLRenderTarget;
		const positionFBO = gpuCompute.getCurrentRenderTarget(positionVariable) as THREE.WebGLRenderTarget;
		const completeFBO = gpuCompute.getCurrentRenderTarget(completeVariable) as THREE.WebGLRenderTarget;
		const colorFBO = gpuCompute.getCurrentRenderTarget(colorVariable) as THREE.WebGLRenderTarget;

		const geometry = new THREE.BufferGeometry();
		
		const positionBuffer = [];
		const referenceBuffer = [];
		const indice = [];
		const uvs = [];
		// const size = [];
		
		const segmentWidth = (gl.drawingBufferWidth / ROW_COUNT) / gl.drawingBufferWidth;
		const segmentHeight = (gl.drawingBufferHeight / COLUMN_COUNT) / gl.drawingBufferHeight;
		
		const planeGeometry = new THREE.PlaneGeometry(segmentWidth, segmentHeight);
		const planeGeometryPositionBuffer = Array.from(planeGeometry.getAttribute("position").array);
		const planeGeometryIndice = Array.from(planeGeometry.index?.array || []);
		const planeGeometryVertexCount = planeGeometryPositionBuffer.length / 3.0;

		if (SIZE * SIZE < ROW_COUNT * COLUMN_COUNT) console.error("too small fboSize");

		for (let i = 0; i < PARTICLE_MAX_COUNT; i += 1) {
			positionBuffer.push(...planeGeometryPositionBuffer);
			const rowIndex = Math.floor(i / COLUMN_COUNT);
			const columnIndex = i % COLUMN_COUNT;

			for (let j = 0; j < planeGeometryVertexCount; j += 1) {
				const x = rowIndex / ROW_COUNT;
				const y = (columnIndex + 0.5) / COLUMN_COUNT;
				referenceBuffer.push(x, y);
			}

			for (let j = 0; j < planeGeometryIndice.length; j += 1) {
				const index = planeGeometryIndice[j];
				indice.push(index + i * planeGeometryVertexCount);
			}

			uvs.push(
				(rowIndex + 0)/ROW_COUNT, (columnIndex + 1)/COLUMN_COUNT,
				(rowIndex + 1)/ROW_COUNT, (columnIndex + 1)/COLUMN_COUNT,
				(rowIndex + 0)/ROW_COUNT, (columnIndex + 0)/COLUMN_COUNT,
				(rowIndex + 1)/ROW_COUNT, (columnIndex + 0)/COLUMN_COUNT,
			)
		}

		geometry.setIndex(indice);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(positionBuffer, 3));
		geometry.setAttribute("reference", new THREE.Float32BufferAttribute(referenceBuffer, 2));
		geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
		// geometry.setAttribute("size", new THREE.Float32BufferAttribute(size, 1));

		const material = new THREE.ShaderMaterial({
			transparent: true,
			blending: THREE.NormalBlending,
			uniforms: {
				tDiffuse: {value: textures[0]},
				texturePosition: {value: positionFBO.texture},
				textureProgress: {value: progressFBO.texture},
				textureColor: {value: colorFBO.texture},
			},
			vertexShader: `
			uniform sampler2D texturePosition;
			uniform sampler2D textureProgress;

			attribute vec2 reference;

			varying vec2 v_reference;
			varying vec2 v_uv;

			float random(vec2 st) {
				return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43257.5453123);
			}

			void updateVarying() {
				v_uv = uv;
				v_reference = reference;
			}

			void main() {
				updateVarying();
				float progress = texture(textureProgress, reference).x;
				vec3 translate = texture(texturePosition, reference).xyz;

				vec2 scale = vec2(1.0 - progress);

				vec3 next = position;
				next.xy *= scale;
				next.xy *= 2.0;
				next.xy += reference * 2.0;
				next.xy -= 1.0;
				next.xy += translate.xy;

				next.z += translate.z;

				gl_Position = projectionMatrix * viewMatrix * vec4(next, 1.0);
			}
			`,
			fragmentShader: `
			uniform sampler2D textureColor;

			uniform sampler2D tDiffuse;

			varying vec2 v_reference;
			varying vec2 v_uv;
			
			void main() {
				vec4 tex = texture(tDiffuse, v_uv);
				vec4 tColor = texture(textureColor, v_reference);

				vec4 color = tex;
				color.rgb += tColor.rgb;
				
				color.a = tColor.a;

				gl_FragColor = color;
			}
			`,
		})

		const mesh = new THREE.Mesh(geometry, material);

		scene.add(mesh);

		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene, camera);
		const selectPass = new TexturePass(selectFBO.texture);
		const togglePass = new TexturePass(toggleFBO.texture);
		const progressPass = new TexturePass(progressFBO.texture);
		const positionPass = new TexturePass(positionFBO.texture);

		composer.addPass(renderPass);
		// composer.addPass(positionPass);
		// composer.addPass(selectPass);
		// composer.addPass(progressPass);
		// composer.addPass(togglePass);

		let shouldStop = false;
		animation.current.stop = () => {shouldStop = true};

		function tick(time: number) {
			if (shouldStop) return;
			gpuCompute.compute();
			composer.render();
			gl.endFrameEXP();
			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderMove: (e) => {
			const {locationX, locationY, timestamp} = e.nativeEvent;
			let x = locationX / layout.current.width;
			let y = locationY / layout.current.height;
			y *= 2.0;
			y -= 1.0;
			y *= -1.0;
			y += 1.0;
			y /= 2.0;

			touch.x = x;
			touch.y = y;
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
					aspectRatio: 3 / 4,
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