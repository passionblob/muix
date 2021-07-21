import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource, NativeTouchEvent, GestureResponderEvent, LayoutRectangle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { CustomAfterimagePass } from './CustomAfterimagePass';
import { GPGPUParticle } from "./GPGPUParticle"
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { GaussianBlurShader } from './GaussianBlurShader';
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass';
import { AppendShader } from './AppendShader';
import { AdditiveShader } from './AdditiveShader';
import { MultiplyShader } from './MultiplyShader';
import { ChromaKeyShader } from './ChromaKeyShader';
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader';
import { BufferGeometry, CircleGeometry } from 'three';
import { SimpleChokerShader } from './SimpleChokerShader';

function appendBlurPass(composer: EffectComposer, strength: number) {
	const iterations = 8;
	for (let i = 0; i < iterations; i += 1) {
		const radius = (iterations - i - 1) * strength;
		const blurPass = new ShaderPass(GaussianBlurShader);
		blurPass.uniforms.direction.value = i % 2 === 0
			? { x: radius, y: 0 }
			: { x: 0, y: radius };
		composer.addPass(blurPass);
	}
}

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

storiesOf("Test/WebGL", module)
	.add("GPGPU-Burn", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const BURN_SIZE = 256;
const SLICE_MAX_COUNT = BURN_SIZE * BURN_SIZE;
// for mapping plane to square;
const SCREEN_ASPECT_RATIO = 3 / 4;
const ROW_COUNT = Math.floor(BURN_SIZE * Math.sqrt(SCREEN_ASPECT_RATIO));
const COLUMN_COUNT = Math.floor(BURN_SIZE / Math.sqrt(SCREEN_ASPECT_RATIO));
const BURNING_DURATION = 5000;
const TIMING_ON_FIRE = 500;
const TIMING_ON_DYING = 1000;
const TIMING_ON_DEAD = 3000;
const POSITION_RESET_COUNT = 3;

const PARTICLE_SIZE = 64;
const PARITLCE_MAX_COUNT = PARTICLE_SIZE * PARTICLE_SIZE;


const TEXTURE_ASPECT_RATIO = 16 / 9;
const SCALE = 0.8;

const SOOT_COLOR = { x: 150 / 255, y: 86 / 255, z: 56 / 255 };
const BURNING_COLOR = { x: 255 / 255, y: 89 / 255, z: 0 / 255 };
const FIRE_COLOR = { x: 255 / 255, y: 50 / 255, z: 0 / 255 };
const WEAK_FIRE_COLOR = { x: 255 / 255, y: 120 / 255, z: 0 / 255 };
const WEAK_BURN_COLOR = { x: 255 / 255, y: 100 / 255, z: 0 / 255 };
const ASH_COLOR = { x: 155 / 255, y: 155 / 255, z: 155 / 255 }

const SimpleGLStory = () => {
	const animation = React.useRef<number>(-1);
	const layout = React.useRef<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });
	const touch = React.useRef({
		x: -100,
		y: -100,
	}).current;

	const clearTargets = React.useRef<{
		texture: THREE.Texture[],
		variable: Variable[],
		geometry: THREE.BufferGeometry[],
		material: THREE.Material[],
	}>({
		texture: [],
		variable: [],
		geometry: [],
		material: [],
	});

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.set(0, 0, 10);

		const gpuCompute = new GPUComputationRenderer(BURN_SIZE, BURN_SIZE, renderer);

		const variableTextures: THREE.DataTexture[] = [];

		const dtPosition = gpuCompute.createTexture();
		const dtProgress = gpuCompute.createTexture();
		const dtSelect = gpuCompute.createTexture();
		const dtToggle = gpuCompute.createTexture();
		const dtComplete = gpuCompute.createTexture();
		const dtColor = gpuCompute.createTexture();

		variableTextures.push(dtPosition, dtProgress, dtSelect, dtToggle, dtComplete, dtColor);

		const selectShader = `
		uniform vec2 touch;
		uniform float scale;
		uniform float screen_aspect_ratio;
		uniform float texture_aspect_ratio;

		const float thresholdConstant = 0.05;
		const float thresholdMultiplier = 0.2;

		float random(vec2 st) {
			return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float progress = texture(textureProgress, uv).x;
			float prev = texture(textureSelect, uv).x;
			float next = prev;
			
			vec2 scaledUV = uv*scale + 0.5 - scale/2.0;

			float d = distance(touch, scaledUV);

			if (d < 0.01) {
				next = 1.0;
			} else {
				next = 0.0;
			}

			float distance = 3.0;
			bool found = false;
			for (float i=0.0; i<distance && !found; i+=1.0) {
				float x = gl_FragCoord.x - floor(distance/2.0) + i;
				for (float j=0.0; j<distance && !found; j+=1.0) {
					float y = gl_FragCoord.y - floor(distance/2.0) + j;
					vec2 adjacent = vec2(x, y) / resolution;
					float progress = texture(textureProgress, adjacent).x;
					if (progress > thresholdConstant + random(uv) * thresholdMultiplier) {
						found = true;
						next = 1.0;
					}
				}
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

		const firePositionShader = `
		const float dt = 0.01666666;

		uniform float progress_on_fire;
		uniform float progress_on_dying;
		uniform float progress_on_dead;
		uniform float position_reset_count;

		float random(vec2 st) {
			return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43257.5453123);
		}

		float interpolate(float t, float tMin, float tMax, float value1, float value2) {
			if (t <= tMin) return value1;
			if (t >= tMax) return value2;
			float progress = (t - tMin) / (tMax - tMin);
			return value1 + (value2 - value1) * progress;
		}

		float getLuminance(vec3 rgb) {
			return dot(rgb, vec3(0.375, 0.5, 0.125));
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float index = resolution.x * gl_FragCoord.y + gl_FragCoord.x;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			float progress = texture(textureProgress, uv).x;
			vec4 color = texture(textureColor, uv);
			float luminance = getLuminance(color.rgb);
			vec3 prev = texture(texturePosition, uv).xyz;
			vec3 next = prev;

			if (progress < progress_on_fire) {
				float p = interpolate(progress, 0.0, progress_on_fire, 0.0, 1.0);
			} else if (progress < progress_on_dying) {
				float p = interpolate(progress, progress_on_fire, progress_on_dying, 0.0, 1.0);
			} else if (progress < progress_on_dead) {
				float p = interpolate(progress, progress_on_dying, progress_on_dead, 0.0, 1.0);

				float swingAngle = 30.0;
				float swingCount = 1.0;
				float swingCountRandomiser = 0.5;
				float swingAngleRandomiser = 60.0;
				float randomisedSwingAngle = swingAngle - swingAngleRandomiser/2.0 + swingAngleRandomiser * random(uv -0.443);
				float randomisedSwingCount = swingCount - swingCountRandomiser/2.0 + swingCountRandomiser * random(uv + 0.12);
				float swingAngleFactor = sin(radians(360.0 * 2.0 * randomisedSwingCount * p * (1.0 + position_reset_count))) * randomisedSwingAngle * (1.0 - p * 2.0);
				float pureAngle = 0.0;
				float angleRandomiser = 30.0;
				float angleRandomFactor = -angleRandomiser/2.0 + angleRandomiser * random(uv + 0.123);
				float angle = radians(pureAngle + swingAngleFactor + angleRandomFactor);
				
				float acc = -0.0 * (1.0 + position_reset_count);
				float initialVelocity = 0.15 * (1.0 + position_reset_count);
				float initialVelocityRandomiser = 0.05 * (1.0 + position_reset_count);
				float randomisedInitialVelocity =
					initialVelocity 
					- initialVelocityRandomiser/2.0
					+ initialVelocityRandomiser * random(uv * 2.0);
				float velocity = randomisedInitialVelocity * (1.0 - p);

				float interval = (progress_on_dead - progress_on_dying) / (1.0 + position_reset_count);

				for (float i=0.0; i<1.0 + position_reset_count; i += 1.0) {
					float from = progress_on_dying + interval * i;
					float to = from + interval / 5.0;
					if (progress >= from && progress < to) {
						next.xy = vec2(0.0);
					}
				}

				next.xy += vec2(sin(angle), cos(angle)) * velocity * dt;
				
			} else if (luminance >= 0.2) {
				next.xy = vec2(0.0);
			}

			gl_FragColor = vec4(next, 0.0);
		}
		`;

		const colorShader = `
		const float dt = 0.016666666;

		uniform float progress_on_fire;
		uniform float progress_on_dying;
		uniform float progress_on_dead;
		uniform float position_reset_count;

		uniform vec3 burning_color;
		uniform vec3 fire_color;
		uniform vec3 weak_burn_color;
		uniform vec3 weak_fire_color;
		uniform vec3 ash_color;

		float easeInOutCubic(float x) {
			return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
		}

		float getLuminance(vec3 rgb) {
			return dot(rgb, vec3(0.375, 0.5, 0.125));
		}

		float interpolate(float t, float tMin, float tMax, float value1, float value2) {
			if (t <= tMin) return value1;
			if (t >= tMax) return value2;
			float progress = (t - tMin) / (tMax - tMin);
			return value1 + (value2 - value1) * progress;
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			bool completed = texture(textureComplete, uv).x >= 1.0;
			float progress = texture(textureProgress, uv).x;
			vec4 prev = texture(textureColor, uv);
			vec4 next = prev;
			float luminance = getLuminance(prev.rgb);

			if (progress < progress_on_fire) {
				float from = 0.0;
				float to1 = 0.0 + progress_on_fire / 3.0 * 1.0;
				float to2 = to1 + progress_on_fire / 3.0 * 2.0;

				if (progress >= from && progress < to1) {
					float p = interpolate(progress, from, to1, 0.0, 1.0);
					next = mix(
						vec4(0.0),
						vec4(weak_burn_color, 1.0),
						p
					);
				} else if (progress >= to1 && progress < to2) {
					float p = interpolate(progress, from, to1, 0.0, 1.0);
					next = mix(
						vec4(weak_burn_color, 1.0),
						vec4(burning_color, 1.0),
						p
					);
				}
			} else if (progress < progress_on_dying) {
				float p = interpolate(progress, progress_on_fire, progress_on_dying, 0.0, 1.0);
				next = mix(
					vec4(burning_color, 1.0),
					vec4(fire_color, 1.0),
					p
				);
			} else if (progress < progress_on_dead) {
				float interval = (progress_on_dead - progress_on_dying) / (1.0 + position_reset_count);

				for (float i=0.0; i<position_reset_count; i += 1.0) {
					float from = progress_on_dying + interval * i;
					float to1 = from + interval / 3.0 * 1.0;
					float to2 = to1 + interval / 3.0 * 1.0;
					float to3 = to2 + interval / 3.0 * 1.0;
					if (progress >= from && progress < to1) {
						float p = interpolate(progress, from, to1, 0.0, 1.0);
						next = mix(
							vec4(burning_color, 1.0),
							vec4(fire_color, 1.0),
							p
						);
					} else if (progress >= to1 && progress < to2) {
						float p = interpolate(progress, to1, to2, 0.0, 1.0);
						next = mix(
							vec4(fire_color, 1.0),
							vec4(weak_fire_color, 1.0),
							p
						);
					} else if (progress >= to2 && progress < to3) {
						float p = interpolate(progress, to2, to3, 0.0, 1.0);
						next = mix(
							vec4(weak_fire_color, 1.0),
							vec4(ash_color, 1.0),
							p
						);
					}
				} 
			} else {
				next.rgb *= 0.998;
			}

			if (progress >= 1.0 && luminance <= 0.5) {
				next.rgb = vec3(0.0);
			}

			gl_FragColor = next;
		}
		`;

		const variables: Variable[] = []

		const selectVariable = gpuCompute.addVariable("textureSelect", selectShader, dtSelect);
		const toggleVariable = gpuCompute.addVariable("textureToggle", toggleShader, dtToggle);
		const progressVariable = gpuCompute.addVariable("textureProgress", progressShader, dtProgress);
		const colorVariable = gpuCompute.addVariable("textureColor", colorShader, dtColor);
		const positionVariable = gpuCompute.addVariable("texturePosition", firePositionShader, dtPosition);
		const completeVariable = gpuCompute.addVariable("textureComplete", completeShader, dtComplete);

		variables.push(selectVariable, toggleVariable, progressVariable, colorVariable, positionVariable, completeVariable);
		clearTargets.current.variable.push(selectVariable, toggleVariable, progressVariable, colorVariable, positionVariable, completeVariable)

		gpuCompute.setVariableDependencies(selectVariable, [selectVariable, progressVariable]);
		gpuCompute.setVariableDependencies(toggleVariable, [selectVariable, toggleVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(progressVariable, [toggleVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(completeVariable, [completeVariable, toggleVariable, selectVariable, progressVariable]);
		gpuCompute.setVariableDependencies(positionVariable, [positionVariable, progressVariable, toggleVariable, colorVariable]);
		gpuCompute.setVariableDependencies(colorVariable, [colorVariable, progressVariable, completeVariable]);

		Object.assign(selectVariable.material.uniforms, {
			touch: { value: touch },
			scale: { value: SCALE },
			screen_aspect_ratio: { value: SCREEN_ASPECT_RATIO },
			texture_aspect_ratio: { value: TEXTURE_ASPECT_RATIO },
		})

		Object.assign(completeVariable.material.uniforms, {
			shouldRecover: { value: false },
		})

		Object.assign(progressVariable.material.uniforms, {
			duration: { value: BURNING_DURATION }
		})

		Object.assign(positionVariable.material.uniforms, {
			progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
			progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
			progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
			position_reset_count: { value: POSITION_RESET_COUNT },
		})

		Object.assign(colorVariable.material.uniforms, {
			progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
			progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
			progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
			position_reset_count: { value: POSITION_RESET_COUNT },
			soot_color: { value: SOOT_COLOR },
			burning_color: { value: BURNING_COLOR },
			fire_color: { value: FIRE_COLOR },
			weak_fire_color: { value: WEAK_FIRE_COLOR },
			weak_burn_color: { value: WEAK_BURN_COLOR },
			ash_color: { value: ASH_COLOR },
		})

		gpuCompute.init();
		variableTextures.forEach((t) => t.dispose);

		const selectFBO = gpuCompute.getCurrentRenderTarget(selectVariable) as THREE.WebGLRenderTarget;
		const toggleFBO = gpuCompute.getCurrentRenderTarget(toggleVariable) as THREE.WebGLRenderTarget;
		const progressFBO = gpuCompute.getCurrentRenderTarget(progressVariable) as THREE.WebGLRenderTarget;
		const positionFBO = gpuCompute.getCurrentRenderTarget(positionVariable) as THREE.WebGLRenderTarget;
		const completeFBO = gpuCompute.getCurrentRenderTarget(completeVariable) as THREE.WebGLRenderTarget;
		const colorFBO = gpuCompute.getCurrentRenderTarget(colorVariable) as THREE.WebGLRenderTarget;

		const burnGeometry = new THREE.BufferGeometry();

		clearTargets.current.geometry.push(burnGeometry);

		const burnPositionBuffer = [];
		const burnReferenceBuffer = [];
		const burnIndice = [];
		const burnUvs = [];
		// const size = [];

		const segmentWidth = (gl.drawingBufferWidth / ROW_COUNT) / gl.drawingBufferWidth;
		const segmentHeight = (gl.drawingBufferHeight / COLUMN_COUNT) / gl.drawingBufferHeight;

		const planeGeometry = new THREE.PlaneGeometry(segmentWidth, segmentHeight);
		const planeGeometryPositionBuffer = Array.from(planeGeometry.getAttribute("position").array);
		const planeGeometryIndice = Array.from(planeGeometry.index?.array || []);
		const planeGeometryVertexCount = planeGeometryPositionBuffer.length / 3.0;

		if (BURN_SIZE * BURN_SIZE < ROW_COUNT * COLUMN_COUNT) console.error("too small fboSize");

		for (let i = 0; i < SLICE_MAX_COUNT; i += 1) {
			burnPositionBuffer.push(...planeGeometryPositionBuffer);
			const rowIndex = Math.floor(i / COLUMN_COUNT);
			const columnIndex = i % COLUMN_COUNT;

			for (let j = 0; j < planeGeometryVertexCount; j += 1) {
				const x = rowIndex / ROW_COUNT;
				const y = (columnIndex + 0.5) / COLUMN_COUNT;
				burnReferenceBuffer.push(x, y);
			}

			for (let j = 0; j < planeGeometryIndice.length; j += 1) {
				const index = planeGeometryIndice[j];
				burnIndice.push(index + i * planeGeometryVertexCount);
			}

			burnUvs.push(
				(rowIndex + 0) / ROW_COUNT, (columnIndex + 1) / COLUMN_COUNT,
				(rowIndex + 1) / ROW_COUNT, (columnIndex + 1) / COLUMN_COUNT,
				(rowIndex + 0) / ROW_COUNT, (columnIndex + 0) / COLUMN_COUNT,
				(rowIndex + 1) / ROW_COUNT, (columnIndex + 0) / COLUMN_COUNT,
			)
		}

		burnGeometry.setIndex(burnIndice);
		burnGeometry.setAttribute("position", new THREE.Float32BufferAttribute(burnPositionBuffer, 3));
		burnGeometry.setAttribute("reference", new THREE.Float32BufferAttribute(burnReferenceBuffer, 2));
		burnGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(burnUvs, 2));
		// geometry.setAttribute("size", new THREE.Float32BufferAttribute(size, 1));

		const circleGeometry = new CircleGeometry(0.03);

		const circleGeometryPositionBuffer = Array.from(circleGeometry.getAttribute("position").array);
		const circleGeometryIndice = Array.from(circleGeometry.index?.array || []);
		const circleGeometryVertexCount = circleGeometryPositionBuffer.length / 3.0;

		const particlePositionBuffer = [];
		const particleReferenceBuffer = [];
		const particleIndice = [];

		const particleGeometry = new BufferGeometry();

		const PARTICLE_TO_BURN_SCALE = BURN_SIZE / PARTICLE_SIZE;
		const SCALED_ROW_COUNT = ROW_COUNT / PARTICLE_TO_BURN_SCALE;
		const SCALED_COLUMN_COUNT = COLUMN_COUNT / PARTICLE_TO_BURN_SCALE;

		for (let i = 0; i < PARITLCE_MAX_COUNT; i += 1) {
			particlePositionBuffer.push(...circleGeometryPositionBuffer);
			const rowIndex = Math.floor(i / SCALED_COLUMN_COUNT);
			const columnIndex = i % SCALED_COLUMN_COUNT;

			for (let j = 0; j < circleGeometryVertexCount; j += 1) {
				const x = rowIndex / SCALED_ROW_COUNT;
				const y = (columnIndex + 0.5) / SCALED_COLUMN_COUNT;
				particleReferenceBuffer.push(x, y);
			}

			for (let j = 0; j < circleGeometryIndice.length; j += 1) {
				const index = circleGeometryIndice[j];
				particleIndice.push(index + i * circleGeometryVertexCount);
			}
		}

		particleGeometry.setIndex(particleIndice);
		particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositionBuffer, 3));
		particleGeometry.setAttribute("reference", new THREE.Float32BufferAttribute(particleReferenceBuffer, 2));

		const burnMaterial = new THREE.ShaderMaterial({
			transparent: true,
			blending: THREE.AdditiveBlending,
			uniforms: {
				textureProgress: { value: progressFBO.texture },
				textureColor: { value: colorFBO.texture },
				textureDiffuse: { value: textures[0] },
				progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
				progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
				progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
				position_reset_count: { value: POSITION_RESET_COUNT },
			},
			vertexShader: `
			uniform sampler2D textureProgress;

			uniform float progress_on_fire;
			uniform float progress_on_dying;
			uniform float progress_on_dead;
			uniform float position_reset_count;

			attribute vec2 reference;

			varying vec2 v_reference;
			varying vec2 v_uv;

			float random(vec2 st) {
				return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43257.5453123);
			}

			float easeOutCubic(float x) {
				return 1.0 - pow(1.0 - x, 3.0);
			}

			float easeInCubic(float x) {
				return x * x * x;
			}

			void updateVarying() {
				v_uv = uv;
				v_reference = reference;
			}

			float interpolate(float t, float tMin, float tMax, float value1, float value2) {
				if (t <= tMin) return value1;
				if (t >= tMax) return value2;
				float progress = (t - tMin) / (tMax - tMin);
				return value1 + (value2 - value1) * progress;
			}

			void main() {
				updateVarying();
				float progress = texture(textureProgress, reference).x;

				vec2 scale = vec2(1.0);

				if (progress < progress_on_fire) {
					float p = interpolate(progress, 0.0, progress_on_fire, 0.0, 1.0);
				} else if (progress < progress_on_dying) {
					float p = interpolate(progress, progress_on_fire, progress_on_dying, 0.0, 1.0);
				} else if (progress < progress_on_dead) {
					float p = interpolate(progress, progress_on_dying, progress_on_dead, 0.0, 1.0);

					float interval = (progress_on_dead - progress_on_dying) / (1.0 + position_reset_count);

					for (float i=0.0; i<1.0 + position_reset_count; i += 1.0) {
						float from = progress_on_dying + interval * i;
						float to1 = from + interval / 3.0 * 1.0;
						float to2 = to1 + interval / 3.0 * 2.0;
						if (progress >= from && progress < to1) {
							float p = interpolate(progress, from, to1, 0.0, 1.0);
							scale.xy = mix(vec2(1.0), vec2(1.0), easeInCubic(p));
						} else if (progress >= to1 && progress < to2) {
							float p = interpolate(progress, to1, to2, 0.0, 1.0);
							scale.xy = mix(vec2(1.0), vec2(1.0), easeOutCubic(p));
						}
					}
				}

				vec4 next = vec4(position, 1.0);
				next.xy *= scale;
				next.xy *= 2.0;
				next.xy += reference * 2.0;
				next.xy -= 1.0;

				gl_Position = projectionMatrix * modelViewMatrix * next;
			}
			`,
			fragmentShader: `
			uniform sampler2D textureColor;
			uniform sampler2D textureProgress;
			uniform sampler2D textureDiffuse;

			varying vec2 v_reference;
			varying vec2 v_uv;
			
			void main() {
				float progress = texture(textureProgress, v_reference).x;
				vec4 tOrigin = texture(textureDiffuse, v_uv);
				vec4 tColor = texture(textureColor, v_reference);

				vec4 color = mix(tOrigin, tColor, tColor.a);

				gl_FragColor = color;
			}
			`,
		})

		const fireMaterial = new THREE.ShaderMaterial({
			transparent: true,
			uniforms: {
				textureProgress: { value: progressFBO.texture },
				texturePosition: {value: positionFBO.texture},
				progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
				progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
				progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
				position_reset_count: { value: POSITION_RESET_COUNT },
			},
			vertexShader: `
			uniform sampler2D textureProgress;
			uniform sampler2D texturePosition;

			uniform float progress_on_fire;
			uniform float progress_on_dying;
			uniform float progress_on_dead;
			uniform float position_reset_count;

			attribute vec2 reference;

			varying vec2 v_reference;
			varying vec2 v_uv;

			float random(vec2 st) {
				return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43257.5453123);
			}

			float easeOutCubic(float x) {
				return 1.0 - pow(1.0 - x, 3.0);
			}

			float easeInCubic(float x) {
				return x * x * x;
			}

			void updateVarying() {
				v_uv = uv;
				v_reference = reference;
			}

			float interpolate(float t, float tMin, float tMax, float value1, float value2) {
				if (t <= tMin) return value1;
				if (t >= tMax) return value2;
				float progress = (t - tMin) / (tMax - tMin);
				return value1 + (value2 - value1) * progress;
			}

			void main() {
				updateVarying();
				float progress = texture(textureProgress, reference).x;
				vec3 translate = texture(texturePosition, reference).xyz;

				float scale = 1.0;

				if (progress < progress_on_fire) {
					float p = interpolate(progress, 0.0, progress_on_fire, 0.0, 1.0);
				} else if (progress < progress_on_dying) {
					float p = interpolate(progress, progress_on_fire, progress_on_dying, 0.0, 1.0);
				} else if (progress < progress_on_dead) {

					float interval = (progress_on_dead - progress_on_dying) / (1.0 + position_reset_count);	
					for (float i=0.0; i<1.0 + position_reset_count; i += 1.0) {
						float from = progress_on_dying + interval * i;
						float to1 = from + interval / 2.0;
						float to2 = to1 + interval / 2.0;
						if (progress >= from && progress < to1) {
							float p = interpolate(progress, from, to1, 0.0, 1.0);
							scale = mix(0.0, 0.5, easeOutCubic(p));
						} else if (progress >= to1 && progress < to2) {
							float p = interpolate(progress, to1, to2, 0.0, 1.0);
							scale = mix(0.5, 0.0, easeInCubic(p));
						}
					}
				}

				vec4 next = vec4(position, 1.0);
				next.xy *= scale;
				next.xy *= 2.0;
				next.xy += reference * 2.0;
				next.xy -= 1.0;
				next.xy += translate.xy;

				gl_Position = projectionMatrix * modelViewMatrix * next;
			}
			`,
			fragmentShader: `
			uniform sampler2D textureProgress;

			uniform float progress_on_fire;
			uniform float progress_on_dying;
			uniform float progress_on_dead;
			uniform float position_reset_count;

			varying vec2 v_reference;
			varying vec2 v_uv;
			
			float interpolate(float t, float tMin, float tMax, float value1, float value2) {
				if (t <= tMin) return value1;
				if (t >= tMax) return value2;
				float progress = (t - tMin) / (tMax - tMin);
				return value1 + (value2 - value1) * progress;
			}

			float random(vec2 st) {
				return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
			}

			void main() {
				float progress = texture(textureProgress, v_reference).x;

				bool isWeakFire = step(0.5, random(v_reference)) >= 1.0;

				float alpha = 0.0;
				vec3 color = vec3(1.0 - progress);

				if (progress < progress_on_fire) {
					color = vec3(0.0);
				} else if (progress < progress_on_dying) {
					color = vec3(0.0);
				} else if (progress < progress_on_dead) {
					float interval = (progress_on_dead - progress_on_dying) / (1.0 + position_reset_count);

					for (float i=0.0; i<1.0 + position_reset_count; i += 1.0) {
						float from = progress_on_dying + interval * i;
						float to = from + interval;
						if (progress >= from && progress < to) {
							float p = interpolate(progress, from, to, 0.0, 1.0);

							if (isWeakFire) {
								color = mix(
									vec3(0.0, 0.0, 1.0),
									vec3(1.0, 1.0, 0.0),
									p
								);
							} else {
								color = mix(
									vec3(1.0, 0.0, 0.0),
									vec3(1.0, 1.0, 0.0),
									p
								);
							}

						}
					}
	
					alpha = 1.0;
				} else {
					color = vec3(0.0);
				}	

				gl_FragColor = vec4(color, alpha);
			}
			`,
		})

		
		
		clearTargets.current.material.push(burnMaterial);
		clearTargets.current.material.push(fireMaterial);
		
		const burnMesh = new THREE.Mesh(burnGeometry, burnMaterial);
		const fireMesh = new THREE.Mesh(particleGeometry, fireMaterial);
		const fireScene = scene.clone();
		const fireCamera = camera.clone();

		let scaleX = 1;
		let scaleY = 1;
		// scaleY *= SCREEN_ASPECT_RATIO;
		// scaleY /= TEXTURE_ASPECT_RATIO;
		scaleX *= SCALE;
		scaleY *= SCALE;
		burnMesh.scale.set(scaleX, scaleY, SCALE);
		fireMesh.scale.set(scaleX, scaleY, SCALE);
		scene.add(burnMesh);
		// scene.add(fireMesh);

		fireScene.add(fireMesh);

		const composer = new EffectComposer(renderer);

		const fireFBO = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight);
		const fireSavePass = new SavePass(fireFBO);
		const fireRenderPass = new RenderPass(fireScene, fireCamera);
		const afterImagePass = new CustomAfterimagePass();
		const simpleChokerPass = new ShaderPass(SimpleChokerShader);
		simpleChokerPass.uniforms.threshold = {value: 0.5};
		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
			1.0,
			1.0,
			0.2,
		)
		const renderPass = new RenderPass(scene, camera);
		const fireAppendPass = new ShaderPass(AppendShader);
		fireAppendPass.uniforms.map = {value: fireFBO.texture};
		
		composer.addPass(fireRenderPass);
		composer.addPass(afterImagePass);
		appendBlurPass(composer, 0.3);
		composer.addPass(simpleChokerPass);
		composer.addPass(bloomPass);
		composer.addPass(fireSavePass);
		composer.addPass(renderPass);
		composer.addPass(fireAppendPass);

		function tick(time: number) {
			gpuCompute.compute();
			composer.render();

			variables.forEach((v) => {
				const t = gpuCompute.getAlternateRenderTarget(v) as THREE.WebGLRenderTarget;
				t.dispose();
			});

			gl.endFrameEXP();
			animation.current = requestAnimationFrame(tick);
		}

		animation.current = requestAnimationFrame(tick);
	}

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderStart: (e) => {
			const { locationX, locationY, timestamp } = e.nativeEvent;
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
			if (animation.current !== -1) {
				cancelAnimationFrame(animation.current);
				animation.current = -1;
			}
			clearTargets.current.geometry.forEach((g) => g.dispose)
			clearTargets.current.material.forEach((m) => m.dispose)
			clearTargets.current.variable.forEach((v) => {
				(v.renderTargets as THREE.WebGLRenderTarget[]).forEach((t) => t.dispose)
			})
			clearTargets.current.texture.forEach((t) => t.dispose)
		}
	});

	return (
		<ScrollView>
			<GLView
				onLayout={(e) => { layout.current = e.nativeEvent.layout }}
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: SCREEN_ASPECT_RATIO,
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