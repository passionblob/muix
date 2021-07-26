import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource, NativeTouchEvent, GestureResponderEvent, LayoutRectangle, LayoutChangeEvent } from 'react-native';
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
import { Responsive } from '@monthem/muix/src';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass';
import { PlaneGeometry } from '@pixi/mesh-extras';

function appendBlurPass(composer: EffectComposer, strength: number) {
	const iterations = 5;
	for (let i = 0; i < iterations; i += 1) {
		const radius = (iterations - i - 1) * strength;
		const blurPass = new ShaderPass(GaussianBlurShader);
		blurPass.uniforms.direction.value = i % 2 === 0
			? { x: radius, y: 0 }
			: { x: 0, y: radius };
		composer.addPass(blurPass);
	}
}

const fireTexture = new TextureLoader().load(require("./fire_texture.jpg"))

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

storiesOf("Test/WebGL", module)
	.add("GPGPU-Burn", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const GPGPU_TEXTURE_SIZE = 128;

const SCREEN_ASPECT_RATIO = 3 / 4;
const TEXTURE_ASPECT_RATIO = 3 / 4;
const SCALE = 0.8;

const ROW_COUNT = Math.floor(GPGPU_TEXTURE_SIZE * Math.sqrt(TEXTURE_ASPECT_RATIO));
const COLUMN_COUNT = Math.floor(GPGPU_TEXTURE_SIZE / Math.sqrt(TEXTURE_ASPECT_RATIO));
const BURNING_DURATION = 5000;
const TIMING_ON_FIRE = 0;
const TIMING_ON_DYING = 1000;
const TIMING_ON_DEAD = 3000;
const POSITION_RESET_COUNT = 3;

const PARTICLE_TEXTURE_SIZE = 64;
const PARITLCE_MAX_COUNT = PARTICLE_TEXTURE_SIZE * PARTICLE_TEXTURE_SIZE;


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

		const fireFBO = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight);
		const paperMaskFBO = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight);

		const gpuCompute = new GPUComputationRenderer(GPGPU_TEXTURE_SIZE, GPGPU_TEXTURE_SIZE, renderer);

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
			
			vec2 scaleFactor = vec2(scale);
			scaleFactor *= vec2(1.0, 1.0 * screen_aspect_ratio);
			scaleFactor *= vec2(1.0, 1.0 / texture_aspect_ratio);
			vec2 scaledUV = uv*scaleFactor + 0.5 - scaleFactor/2.0;

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

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution;
			float index = resolution.x * gl_FragCoord.y + gl_FragCoord.x;
			bool toggled = texture(textureToggle, uv).x >= 1.0;
			float progress = texture(textureProgress, uv).x;
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
				
				float acc = -0.5 * (1.0 + position_reset_count);
				float initialVelocity = 0.25 * (1.0 + position_reset_count);
				float initialVelocityRandomiser = 0.10 * (1.0 + position_reset_count);
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
			} else {

			}

			gl_FragColor = vec4(next, 0.0);
		}
		`;

		const variables: Variable[] = []

		const selectVariable = gpuCompute.addVariable("textureSelect", selectShader, dtSelect);
		const toggleVariable = gpuCompute.addVariable("textureToggle", toggleShader, dtToggle);
		const progressVariable = gpuCompute.addVariable("textureProgress", progressShader, dtProgress);
		const positionVariable = gpuCompute.addVariable("texturePosition", firePositionShader, dtPosition);
		const completeVariable = gpuCompute.addVariable("textureComplete", completeShader, dtComplete);

		variables.push(selectVariable, toggleVariable, progressVariable, positionVariable, completeVariable);
		clearTargets.current.variable.push(selectVariable, toggleVariable, progressVariable, positionVariable, completeVariable)

		gpuCompute.setVariableDependencies(selectVariable, [selectVariable, progressVariable]);
		gpuCompute.setVariableDependencies(toggleVariable, [selectVariable, toggleVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(progressVariable, [toggleVariable, progressVariable, completeVariable]);
		gpuCompute.setVariableDependencies(completeVariable, [completeVariable, toggleVariable, selectVariable, progressVariable]);
		gpuCompute.setVariableDependencies(positionVariable, [positionVariable, progressVariable, toggleVariable]);

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

		gpuCompute.init();
		variableTextures.forEach((t) => t.dispose);

		const selectFBO = gpuCompute.getCurrentRenderTarget(selectVariable) as THREE.WebGLRenderTarget;
		const toggleFBO = gpuCompute.getCurrentRenderTarget(toggleVariable) as THREE.WebGLRenderTarget;
		const progressFBO = gpuCompute.getCurrentRenderTarget(progressVariable) as THREE.WebGLRenderTarget;
		const positionFBO = gpuCompute.getCurrentRenderTarget(positionVariable) as THREE.WebGLRenderTarget;
		const completeFBO = gpuCompute.getCurrentRenderTarget(completeVariable) as THREE.WebGLRenderTarget;

		const particleBaseGeometry = new THREE.PlaneGeometry(0.05, 0.05);

		const particleBaseGeometryPositionBuffer = Array.from(particleBaseGeometry.getAttribute("position").array);
		const particleBaseGeometryIndice = Array.from(particleBaseGeometry.index?.array || []);
		const particleBaseGeometryVertexCount = particleBaseGeometryPositionBuffer.length / 3.0;
		const particleBaseGeometryUv = Array.from(particleBaseGeometry.getAttribute("uv").array);

		const particlePositionBuffer = [];
		const particleReferenceBuffer = [];
		const particleIndice = [];
		const uv = [];

		const particleGeometry = new BufferGeometry();

		const PARTICLE_TO_BURN_SCALE = GPGPU_TEXTURE_SIZE / PARTICLE_TEXTURE_SIZE;
		const SCALED_ROW_COUNT = ROW_COUNT / PARTICLE_TO_BURN_SCALE;
		const SCALED_COLUMN_COUNT = COLUMN_COUNT / PARTICLE_TO_BURN_SCALE;

		for (let i = 0; i < PARITLCE_MAX_COUNT; i += 1) {
			particlePositionBuffer.push(...particleBaseGeometryPositionBuffer);
			const rowIndex = Math.floor(i / SCALED_COLUMN_COUNT);
			const columnIndex = i % SCALED_COLUMN_COUNT;

			for (let j = 0; j < particleBaseGeometryVertexCount; j += 1) {
				const x = rowIndex / SCALED_ROW_COUNT;
				const y = (columnIndex + 0.5) / SCALED_COLUMN_COUNT;
				particleReferenceBuffer.push(x, y);
				uv.push(...particleBaseGeometryUv);
			}

			for (let j = 0; j < particleBaseGeometryIndice.length; j += 1) {
				const index = particleBaseGeometryIndice[j];
				particleIndice.push(index + i * particleBaseGeometryVertexCount);
			}
		}

		particleGeometry.setIndex(particleIndice);
		particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositionBuffer, 3));
		particleGeometry.setAttribute("reference", new THREE.Float32BufferAttribute(particleReferenceBuffer, 2));
		particleGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
		particleGeometry.scale(1, TEXTURE_ASPECT_RATIO, 1);

		const baseGeometry = new THREE.PlaneGeometry(2, 2);

		const paperMaskShader = {
			uniforms: {
				tDiffuse: { value: null },
				textureProgress: { value: null },
				progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
				progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
				progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
				position_reset_count: { value: POSITION_RESET_COUNT },
			},
			vertexShader: `
			uniform sampler2D textureProgress;
			varying vec2 v_uv;
			
			void main() {
				v_uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
			`,
			fragmentShader: `
			uniform sampler2D textureProgress;

			uniform float progress_on_fire;
			uniform float progress_on_dying;
			uniform float progress_on_dead;

			varying vec2 v_uv;
			
			void main() {
				float progress = texture(textureProgress, v_uv).x;
				float alpha = 0.0;
				vec3 color = vec3(0.0);

				if (progress >= progress_on_dying) {
					color = vec3(1.0);
					alpha = 1.0;
				}

				gl_FragColor = vec4(color, alpha);
			}
			`,
		}

		const fireMaterial = new THREE.ShaderMaterial({
			transparent: true,
			blending: THREE.AdditiveBlending,
			uniforms: {
				textureProgress: { value: progressFBO.texture },
				texturePosition: { value: positionFBO.texture },
				progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
				progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
				progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
				position_reset_count: { value: POSITION_RESET_COUNT },
				textureFire: {value: fireTexture},
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
				float rotate = 0.0;

				if (progress < progress_on_fire) {
					// float p = interpolate(progress, 0.0, progress_on_fire, 0.0, 1.0);
				} else if (progress < progress_on_dying) {
					// float p = interpolate(progress, progress_on_fire, progress_on_dying, 0.0, 1.0);
				} else if (progress < progress_on_dead) {
					float interval = (progress_on_dead - progress_on_dying) / (1.0 + position_reset_count);	
					for (float i=0.0; i<1.0 + position_reset_count; i += 1.0) {
						float from = progress_on_dying + interval * i;
						float to1 = from + interval / 2.0;
						float to2 = to1 + interval / 2.0;

						float maxScale = 0.5 + random(reference) * 3.0;

						if (progress >= from && progress < to1) {
							float p = interpolate(progress, from, to1, 0.0, 1.0);
							scale = mix(0.0, maxScale, easeOutCubic(p));
						} else if (progress >= to1 && progress < to2) {
							float p = interpolate(progress, to1, to2, 0.0, 1.0);
							scale = mix(maxScale, 0.0, easeInCubic(p));
						}
					}
				}

				vec4 next = vec4(position, 1.0);

				next.xy *= mat2(
					cos(rotate), -sin(rotate),
					sin(rotate), cos(rotate)
				);

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
			uniform sampler2D textureFire;

			uniform float progress_on_fire;
			uniform float progress_on_dying;
			uniform float progress_on_dead;
			uniform float position_reset_count;

			varying vec2 v_reference;
			varying vec2 v_uv;
			
			float easeOutCubic(float x) {
				return 1.0 - pow(1.0 - x, 3.0);
			}

			float easeInCubic(float x) {
				return x * x * x;
			}

			float interpolate(float t, float tMin, float tMax, float value1, float value2) {
				if (t <= tMin) return value1;
				if (t >= tMax) return value2;
				float progress = (t - tMin) / (tMax - tMin);
				return value1 + (value2 - value1) * progress;
			}

			float random(vec2 st) {
				return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
			}

			void drawCircle(vec2 center, float radius, vec3 color, float alpha, float feather) {
				float distance = length(v_uv - center);
				float opacity;
				if (distance < radius - feather) {
					opacity = 1.0;
				} else {
					opacity = 1.0 - smoothstep(radius-feather, radius, distance);
				}
				gl_FragColor = vec4(color, alpha * opacity);
			}

			vec3 rgbToHsl(float r, float g, float b){
				float maxColor = max(max(r, g), b);
				float minColor = min(min(r, g), b);
				float h, s, l = (maxColor + minColor) / 2.0;
		
				if (maxColor == minColor) {
					h = s = 0.0;
				} else {
					float d = maxColor - minColor;
		
					if (l > 0.5) {
						s = d / (2.0 - maxColor - minColor);
					} else {
						s = d / (maxColor + minColor);
					}
		
					if (maxColor == r) {
						float constant;
						if (g < b) {
							constant = 6.0;
						} else {
							constant = 0.0;
						}
						h = (g-b)/d + constant;
					} else if (maxColor == g) {
						h = (b-r)/d + 2.0;
					} else if (maxColor == b) {
						h = (r-g)/d + 4.0;
					}
			
					h /= 6.0;
				}
		
				return vec3(h, s, l);
			}
		
			float hueToRgb(float p, float q, float t) {
				if (t < 0.0) t += 1.0;
				if (t > 1.0) t -= 1.0;
				if (t < 1.0/6.0) return p + (q-p) * 6.0 * t;
				if (t < 1.0/2.0) return q;
				if (t < 2.0/3.0) return p + (q-p) * (2.0/3.0 - t) * 6.0;
				return p;
			}
		
			vec3 hslToRgb(float h, float s, float l) {
				float r, g, b;
		
				if (s == 0.0) {
					r = g = b = l;
				} else {
					float q;
		
					if (l < 0.5) {
						q = l * (1.0 + s);
					} else {
						q = l + s - l * s;
					}
		
					float p = 2.0 * l - q;
		
					r = hueToRgb(p, q, h + 1.0/3.0);
					g = hueToRgb(p, q, h);
					b = hueToRgb(p, q, h - 1.0/3.0);
				}
		
				return vec3(r, g, b);
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

				vec4 fireTex = texture(textureFire, v_uv);
				fireTex.a = alpha;

				vec3 fireHsl = rgbToHsl(fireTex.r, fireTex.g, fireTex.b);
				vec3 hsl = rgbToHsl(color.r, color.g, color.b);

				fireTex.rgb = hslToRgb(hsl.r, hsl.g, fireHsl.b);

				drawCircle(vec2(0.5, 0.5), 0.5, color, alpha, 0.5);

				// gl_FragColor = fireTex;
			}
			`,
		})


		const paperGeometry = baseGeometry.clone()
		const paperMaterial = new THREE.ShaderMaterial({
			transparent: true,
			blending: THREE.AdditiveBlending,
			uniforms: {
				textureProgress: { value: progressFBO.texture },
				textureDiffuse: { value: textures[0] },
				textureMask: { value: paperMaskFBO.texture },
				progress_on_fire: { value: TIMING_ON_FIRE / BURNING_DURATION },
				progress_on_dead: { value: TIMING_ON_DEAD / BURNING_DURATION },
				progress_on_dying: { value: TIMING_ON_DYING / BURNING_DURATION },
				position_reset_count: { value: POSITION_RESET_COUNT },
				soot_color: { value: SOOT_COLOR },
			},
			vertexShader: `
			uniform sampler2D textureProgress;
			varying vec2 v_uv;
			
			void main() {
				v_uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
			`,
			fragmentShader: `
			uniform sampler2D textureProgress;
			uniform sampler2D textureDiffuse;
			uniform sampler2D textureMask;
			uniform vec3 soot_color;

			uniform float progress_on_fire;
			uniform float progress_on_dying;
			uniform float progress_on_dead;
			uniform float position_reset_count;

			varying vec2 v_uv;

			const float thresholdFire = 0.8;
			const float thresholdAsh = 0.9;
			const float thresholdDead = 0.97;

			float interpolate(float t, float tMin, float tMax, float value1, float value2) {
				if (t <= tMin) return value1;
				if (t >= tMax) return value2;
				float progress = (t - tMin) / (tMax - tMin);
				return value1 + (value2 - value1) * progress;
			}

			float random(vec2 st) {
				return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
			}

			float easeOutCubic(float x) {
				return 1.0 - pow(1.0 - x, 3.0);
			}

			void main() {
				float progress = texture(textureProgress, v_uv).x;
				vec4 tMask = texture(textureMask, v_uv);
				vec4 tOrigin = texture(textureDiffuse, v_uv);

				float alpha = 1.0;
				vec3 color = vec3(tOrigin.rgb);
				vec3 colorMultiply = vec3(1.0);

				if (tMask.a <= 0.0) {

				} else {
					if (tMask.a < thresholdFire) {
						float p = interpolate(tMask.a, 0.0, thresholdFire, 0.0, 1.0);
						colorMultiply = mix(
							vec3(1.0),
							soot_color,
							easeOutCubic(p)
						);
						color *= colorMultiply;
					} else if (tMask.a < thresholdAsh) {
						float r = 0.2 + random((v_uv + progress) / 100.0) * 0.8;
						float g = 0.1 + random((v_uv + progress + 0.123) / 100.0) * 0.1;
						float b = 0.0;
						color = vec3(r, g, b);
					} else if (tMask.a < thresholdDead) {
						color = vec3(1.0) * random(v_uv) * 0.05 + vec3(0.3);
					} else {
						alpha = 0.0;
					}
				}	

				gl_FragColor = vec4(color, alpha);
			}
			`,
		})

		clearTargets.current.material.push(paperMaterial);
		clearTargets.current.material.push(fireMaterial);

		const paperMesh = new THREE.Mesh(paperGeometry, paperMaterial);
		const paperScene = scene.clone();
		const paperCamera = camera.clone();

		const fireMesh = new THREE.Mesh(particleGeometry, fireMaterial);
		const fireScene = scene.clone();
		const fireCamera = camera.clone();

		let scaleX = 1;
		let scaleY = 1;
		scaleY *= SCREEN_ASPECT_RATIO;
		scaleY /= TEXTURE_ASPECT_RATIO;
		scaleX *= SCALE;
		scaleY *= SCALE;
		paperMesh.scale.set(scaleX, scaleY, SCALE);
		fireMesh.scale.set(scaleX, scaleY, SCALE);

		paperScene.add(paperMesh);
		fireScene.add(fireMesh);

		const composer = new EffectComposer(renderer);

		const fireSavePass = new SavePass(fireFBO);
		const fireRenderPass = new RenderPass(fireScene, fireCamera);
		const afterImagePass = new CustomAfterimagePass(0.90);
		const simpleChokerPass = new ShaderPass(SimpleChokerShader);
		simpleChokerPass.uniforms.threshold = { value: 0.5 };
		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
			1.0,
			1.0,
			0.2,
		)
		const paperRenderPass = new RenderPass(paperScene, paperCamera);
		const paperMaskRenderPass = new ShaderPass(paperMaskShader);
		paperMaskRenderPass.uniforms.textureProgress.value = progressFBO.texture;
		const paperMaskSavePass = new SavePass(paperMaskFBO);

		const fireAppendPass = new ShaderPass(AppendShader);
		fireAppendPass.uniforms.map = { value: fireFBO.texture };

		// TODO: should find a way to remove all the other passes and remain only renderPass.
		composer.addPass(paperMaskRenderPass);
		appendBlurPass(composer, 1.0);
		composer.addPass(paperMaskSavePass);

		composer.addPass(fireRenderPass);
		composer.addPass(simpleChokerPass);
		composer.addPass(fireSavePass);

		composer.addPass(paperRenderPass);
		composer.addPass(fireAppendPass);

		function tick(time: number) {
			gpuCompute.compute();
			composer.render();

			// variables.forEach((v) => {
			// 	const t = gpuCompute.getAlternateRenderTarget(v) as THREE.WebGLRenderTarget;
			// 	t.dispose();
			// });

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
	}, []);

	return (
		<ScrollView>
			<GLView
				msaaSamples={4}
				onLayout={(e: LayoutChangeEvent) => { layout.current = e.nativeEvent.layout }}
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
				touch photo to light a fire.
			</Text>
		</ScrollView>
	)
}