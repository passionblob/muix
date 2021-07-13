import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { animate } from 'popmotion';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';

import { DisplacementShader } from './DisplacementShader';
import { LinearWipeShader } from './LinearWipeShader';
import { FastNoiseShader } from './FastNoiseShader';
import { CustomAfterimagePass } from './CustomAfterimagePass';
import { AppendShader } from './AppendShader';
import { MultiplyShader } from './MultiplyShader';
import { ColorFillShader } from './ColorFillShader';
import { SimpleChokerShader } from './SimpleChokerShader';
import { AlphaInvertedMatteShader } from './AlphaInvertedMatteShader';
import { AdditiveShader } from './AdditiveShader';
import { ReadPixelShader } from './ReadPixelShader';
import { GaussianBlurShader } from './GaussianBlurShader';
import { ScaleShader } from './ScaleShader';
import { ColorShader } from './ColorShader';
import { ChromaKeyShader } from './ChromaKeyShader';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { AlphaCheckShader } from './AlphaCheckShader';
import { BCShader } from './BCShader';
import { SaturationShader } from './SaturationShader';

const written = new TextureLoader().load(require("./written.jpg"))

class Particle {
	id: THREE.Mesh["id"]
	velocity = { x: 0, y: 0, z: 0 };
	appeared = false;
	constructor(
		public mesh: THREE.Mesh,
	) {
		this.id = this.mesh.id
	}
}

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

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("Burning", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl
		const renderer = new Renderer({ gl });

		const basicFBO = new THREE.WebGLRenderTarget(width, height);
		const blackFBO = basicFBO.clone();
		const noiseFBO = basicFBO.clone();
		const wipeFBO = basicFBO.clone();
		const burningFBO = basicFBO.clone();
		const pixelFBO = basicFBO.clone();
		const fireFBO = basicFBO.clone();
		const fireBlurFBO = basicFBO.clone();
		const burningBlurFBO = basicFBO.clone();
		const bloomFBO = basicFBO.clone();

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

		const fireScene = scene.clone();
		const fireCamera = camera.clone();

		const fullSize = 2;
		const scale = 1.0;
		const size = fullSize * scale

		const geometry = new THREE.PlaneGeometry(size, size);

		const material = new THREE.MeshBasicMaterial({ color: "white" });
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const composers: EffectComposer[] = [];

		const linearWipePass = new ShaderPass(LinearWipeShader({
			angle: 75 + Math.random() * 45,
			feather: 0.01,
			progress: 0.0,
			wave: 0.2 + Math.random() * 0.3,
		}));

		const scalePass = new ShaderPass(ScaleShader);
		scalePass.uniforms.scale.value = { x: 0.8, y: 0.8 };
		const clearPass = new ClearPass();

		const whiteSavePass = new SavePass(blackFBO);
		const noiseSavePass = new SavePass(noiseFBO);
		const wipeSavePass = new SavePass(wipeFBO);
		const burningSavePass = new SavePass(burningFBO);
		const burningBlurSavePass = new SavePass(burningBlurFBO);
		const pixelSavePass = new SavePass(pixelFBO);
		const fireSavePass = new SavePass(fireFBO);
		const fireBlurSavePass = new SavePass(fireBlurFBO);

		const readPixelPass = new ShaderPass(ReadPixelShader({
			resolution: {
				x: gl.drawingBufferWidth,
				y: gl.drawingBufferHeight,
			},
			threshold: {
				x: 0.0,
				y: 0.0,
				z: 0.0,
				w: 0.5,
			}
		}))

		const renderPass = new RenderPass(scene, camera);
		const noisePass = new ShaderPass(FastNoiseShader);
		noisePass.uniforms.scale.value = { x: 16, y: 16 };
		const displacementPass = new ShaderPass(DisplacementShader({
			strength: { x: 0, y: 0.1 }
		}));
		const simpleChokerPass = new ShaderPass(SimpleChokerShader);
		simpleChokerPass.uniforms.threshold.value = 1.0;
		const afterImagePass = new CustomAfterimagePass(0.99, 0.95);
		const burningScalePass = new ShaderPass(ScaleShader);
		burningScalePass.uniforms.scale.value = { x: 0.99, y: 1.0 };
		const fractalWipeAlphaMatte = new ShaderPass(AlphaInvertedMatteShader({}));
		const noiseMultiplyPass = new ShaderPass(MultiplyShader);
		const noiseAdditivePass = new ShaderPass(AdditiveShader);
		const saturationPass = new ShaderPass(SaturationShader({amount: 2.0}));
		const BCPass = new ShaderPass(BCShader);
		BCPass.uniforms.brightness.value = 0.0;
		BCPass.uniforms.contrast.value = 1.5;

		const burningFillPass = new ShaderPass(ColorFillShader("orange"));

		const fireRenderPass = new RenderPass(fireScene, fireCamera);
		const fireChokerPass = new ShaderPass(SimpleChokerShader);
		fireChokerPass.uniforms.threshold.value = 0.01;

		const blackPass = new ShaderPass(ColorShader("black"));

		const blankComposer = new EffectComposer(renderer);
		blankComposer.renderToScreen = false;
		composers.push(blankComposer);
		blankComposer.addPass(blackPass);
		blankComposer.addPass(whiteSavePass);

		const noiseComposer = new EffectComposer(renderer);
		noiseComposer.renderToScreen = false;
		composers.push(noiseComposer);
		noiseComposer.addPass(noisePass);
		noiseComposer.addPass(BCPass);
		noiseComposer.addPass(noiseSavePass);

		const wipeComposer = new EffectComposer(renderer);
		wipeComposer.renderToScreen = false;
		composers.push(wipeComposer);
		wipeComposer.addPass(renderPass);
		wipeComposer.addPass(linearWipePass);
		wipeComposer.addPass(displacementPass);
		wipeComposer.addPass(simpleChokerPass);
		const some = new ShaderPass(MultiplyShader);
		some.uniforms.map.value = written;
		wipeComposer.addPass(some);
		wipeComposer.addPass(scalePass);
		wipeComposer.addPass(wipeSavePass);

		const burningComposer = new EffectComposer(renderer);
		burningComposer.renderToScreen = false;
		composers.push(burningComposer);
		burningComposer.addPass(new TexturePass(wipeFBO.texture));
		burningComposer.addPass(burningScalePass);
		burningComposer.addPass(afterImagePass);
		burningComposer.addPass(fractalWipeAlphaMatte);
		burningComposer.addPass(burningFillPass);
		burningComposer.addPass(noiseMultiplyPass);
		burningComposer.addPass(saturationPass);
		burningComposer.addPass(burningSavePass);

		const burningBlurComposer = new EffectComposer(renderer);
		burningBlurComposer.renderToScreen = false;
		composers.push(burningBlurComposer);

		burningBlurComposer.addPass(new TexturePass(burningFBO.texture));
		appendBlurPass(burningBlurComposer, 0.2);
		burningBlurComposer.addPass(burningBlurSavePass);

		const readPixelComposer = new EffectComposer(renderer);
		readPixelComposer.renderToScreen = false;
		composers.push(readPixelComposer);
		readPixelComposer.addPass(new TexturePass(burningFBO.texture));
		readPixelComposer.addPass(readPixelPass);
		readPixelComposer.addPass(pixelSavePass);

		const fireComposer = new EffectComposer(renderer);
		fireComposer.renderToScreen = false;
		composers.push(fireComposer);
		fireComposer.addPass(fireRenderPass);
		appendBlurPass(fireComposer, 0.5);
		fireComposer.addPass(displacementPass);
		fireComposer.addPass(fireChokerPass);
		fireComposer.addPass(burningFillPass);
		fireComposer.addPass(noiseMultiplyPass);
		fireComposer.addPass(saturationPass);
		fireComposer.addPass(fireSavePass);

		const fireBlurComposer = new EffectComposer(renderer);
		fireBlurComposer.renderToScreen = false;
		composers.push(fireBlurComposer);

		fireBlurComposer.addPass(new TexturePass(fireFBO.texture));
		appendBlurPass(fireBlurComposer, 0.3);
		fireBlurComposer.addPass(fireBlurSavePass);

		// blend blooms in one scene.
		const bloomComposer = new EffectComposer(renderer);
		bloomComposer.renderToScreen = false;
		composers.push(bloomComposer);

		const burningAppendPass = new ShaderPass(AppendShader);
		const fireAppendPass = new ShaderPass(AppendShader);
		burningAppendPass.uniforms.map.value = burningFBO.texture;
		fireAppendPass.uniforms.map.value = fireFBO.texture;

		const burningAdditivePass = new ShaderPass(AdditiveShader);
		const fireAdditivePass = new ShaderPass(AdditiveShader);
		burningAdditivePass.uniforms.map.value = burningFBO.texture;
		fireAdditivePass.uniforms.map.value = fireFBO.texture;

		const burningBlurAppendPass = new ShaderPass(AppendShader);
		const fireBlurAppendPass = new ShaderPass(AppendShader);
		const burningBlurAdditivePass = new ShaderPass(AdditiveShader);
		const fireBlurAdditivePass = new ShaderPass(AdditiveShader);
		burningBlurAppendPass.uniforms.map.value = burningBlurFBO.texture;
		fireBlurAppendPass.uniforms.map.value = fireBlurFBO.texture;
		burningBlurAdditivePass.uniforms.map.value = burningBlurFBO.texture;
		fireBlurAdditivePass.uniforms.map.value = fireBlurFBO.texture;

		const blackRemovePass = new ShaderPass(ChromaKeyShader);
		blackRemovePass.uniforms.color.value = { x: 0, y: 0, z: 0 };

		const bloomSavePass = new SavePass(bloomFBO);

		bloomComposer.addPass(new TexturePass(blackFBO.texture));
		bloomComposer.addPass(burningAppendPass);
		bloomComposer.addPass(fireAppendPass);
		bloomComposer.addPass(blackRemovePass);
		bloomComposer.addPass(bloomSavePass);

		// composer basic burning scene
		const composer = new EffectComposer(renderer);
		composers.push(composer);

		const bloomAppendPass = new ShaderPass(AppendShader);
		bloomAppendPass.uniforms.map.value = bloomFBO.texture;

		composer.addPass(new TexturePass(wipeFBO.texture));
		composer.addPass(burningBlurAppendPass);
		composer.addPass(fireBlurAppendPass);
		composer.addPass(bloomAppendPass);

		
		let particles: { [key: string]: Particle } = {};

		function generateParticle(x: number, y: number, z: number) {
			let scaleX = 1;
			let scaleY = gl.drawingBufferWidth / gl.drawingBufferHeight;
			const random = Math.random();
			const scaleRandomness = 0.5;
			scaleX *= (1 - scaleRandomness) + random * scaleRandomness;
			scaleY *= (1 - scaleRandomness) + random * scaleRandomness;

			const size = 0.04;
			const geometry = new THREE.CircleGeometry(size);
			geometry.scale(scaleX, scaleY, 1);
			const material = new THREE.MeshBasicMaterial({
				color: "white",
				blending: THREE.AdditiveBlending,
			})

			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(x, y, z);

			fireScene.add(mesh);

			const particle = new Particle(mesh);
			particles[mesh.id] = particle;

			const velocityX = 0.00;
			const velocityY = 0.00;
			particle.velocity.x = -velocityX * 0.5 + Math.random() * velocityX;
			particle.velocity.y = velocityY;
			material.opacity = Math.random();
			mesh.scale.set(0, 0, 0);
			animate({
				from: 0,
				to: 1,
				duration: 300,
				onUpdate(latest) {
					material.opacity += 0.01;
					mesh.scale.set(latest, latest, latest);
				},
				onComplete() {
					particle.appeared = true;
				}
			})
		}

		const spreadX = 0;
		const spreadY = 0;

		let count = 0
		animation.current = animate({
			from: 0,
			to: 1,
			ease: Easing.linear,
			repeat: Infinity,
			repeatType: "loop",
			duration: 40000,
			onUpdate(latest) {
				count += 1;
				if (count % 2) return; 

				// scalePass.uniforms.scale.value = latest;
				// noisePass.uniforms.evolution.value += 0.01;
				linearWipePass.uniforms.angle.value = 90 + Math.sin(latest * 360 * Math.PI / 180) * 15;
				linearWipePass.uniforms.progress.value = latest * 1.1;
				displacementPass.uniforms.map.value = noiseFBO.texture;
				noiseAdditivePass.uniforms.map.value = noiseFBO.texture;
				noiseMultiplyPass.uniforms.map.value = noiseFBO.texture;
				fractalWipeAlphaMatte.uniforms.map.value = wipeFBO.texture;

				// fire particle
				const shouldRender = Math.random() > 0.8;
				if (shouldRender) {
					const burningPixels = getBurningPixels()
					if (burningPixels.length) {
						const randomPixel = burningPixels[Math.floor(Math.random() * (burningPixels.length - 1))];
						const { x, y } = randomPixel;
						generateParticle(
							x - spreadX * 0.5 + Math.random() * spreadX,
							y - spreadY * 0.5 + Math.random() * spreadY,
							0
						);
					}
				}

				Object.values(particles).forEach((particle) => {
					const { mesh, id } = particle;
					const shouldRemove =
						particle.appeared &&
						(
							mesh.scale.x <= 0.001
							|| mesh.scale.y <= 0.001
							//@ts-ignore
							|| mesh.material.opacity <= 0.01
						);
					if (shouldRemove) {
						fireScene.remove(mesh);
						delete particles[id];
					} else {
						// group.position.x = Math.sin(time * 0.001);
						particle.velocity.y += Math.random() * 0.002;
						particle.mesh.position.x += particle.velocity.x;
						particle.mesh.position.y += particle.velocity.y;
						particle.mesh.scale.x *= 0.98;
						particle.mesh.scale.y *= 0.98;

						if (particle.appeared) {
							particle.velocity.x += (-0.5 + Math.random()) * 0.02;
							// @ts-ignore
							particle.mesh.material.opacity *= 0.98;
						}
					}
				})

				composers.forEach((composer) => composer.render());
				gl.endFrameEXP();
			}
		})

		function getBurningPixels() {
			readPixelPass.uniforms.random.value = Math.random();
			const pixels = new Uint8Array(gl.drawingBufferWidth * 1 * 4);
			renderer.readRenderTargetPixels(
				pixelFBO,
				0, 0,
				gl.drawingBufferWidth, 1,
				pixels,
			);
			const pixelObjs: { x: number, y: number }[] = [];
			const sliceLength = 4;
			const jump = 8;
			for (let i = 0; i < pixels.length; i += sliceLength * jump) {
				const sliced = pixels.slice(i, i + sliceLength);
				const x = sliced[0] / 255 * 2 - 1;
				const y = sliced[1] / 255 * 2 - 1;
				const alpha = sliced[3] / 255 * 2 - 1;
				const pixelObj = { x, y };

				if (alpha > 0) {
					pixelObjs.push(pixelObj);
				}
			}

			return pixelObjs;
		}

	}

	React.useEffect(() => {
		return () => {
			animation.current?.stop()
		}
	}, [])

	return (
		<ScrollView>
			<View style={{ backgroundColor: "black" }}>
				<GLView
					style={{
						width: "100%",
						height: undefined,
						aspectRatio: 3 / 4,
						backgroundColor: "transparent"
					}}
					onContextCreate={onContextCreate}
				/>
			</View>
		</ScrollView>
	)
}
