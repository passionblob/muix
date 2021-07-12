import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { animate } from 'popmotion';
import { FBMNoiseShader } from './FBMNoiseShader';
import { DisplacementShader } from './DisplacementShader';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { LinearWipeShader } from './LinearWipeShader';
import { FastNoiseShader } from './FastNoiseShader';
import { CustomAfterImageShader } from './CustomAfterimageShader';
import { CustomAfterimagePass } from './CustomAfterimagePass';
import { AppendTextureShader } from './AppendTextureShader';
import { MultiplyShader } from './MultiplyShader';
import { ColorFillShader } from './ColorFillShader';
import { SimpleChokerShader } from './SimpleChokerShader';
import { AlphaInvertedMatteShader } from './AlphaInvertedMatteShader';
import { AdditiveShader } from './AdditiveShader';
import { SaturationShader } from './SaturationShader';
import { ReadPixelShader } from './ReadPixelShader';
import { GaussianBlurShader } from './GaussianBlurShader';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { ScaleShader } from './ScaleShader';

const fireTexture = new TextureLoader().load(require("./point-particle.png"))

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

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

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("Burning", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

		const fireScene = scene.clone();
		const fireCamera = camera.clone();

		const geometry = new THREE.PlaneGeometry(2, 2);

		const basicFBO = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight);
		const noiseFBO = basicFBO.clone();
		const fractalWipeFBO = basicFBO.clone();
		const burntFBO = basicFBO.clone();
		const burnBottomFBO = basicFBO.clone();
		const burningFBO = basicFBO.clone();
		const readPixelFBO = basicFBO.clone();
		const fireFBO = basicFBO.clone();

		const material = new THREE.MeshBasicMaterial({ color: "white" });
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		const composer = new EffectComposer(renderer);
		const linearWipePass = new ShaderPass(LinearWipeShader({
			angle: 75 + Math.random() * 45,
			feather: 0.1,
			progress: 0.0,
			wave: 0.2 + Math.random() * 0.3,
		}));

		const clearPass = new ClearPass();
		const copyPass = new ShaderPass(CopyShader);
		const scalePass = new ShaderPass(ScaleShader);

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

		const noisePass = new ShaderPass(FastNoiseShader);
		const noiseSavePass = new SavePass(noiseFBO);
		const renderPass = new RenderPass(scene, camera);
		const displacementPass = new ShaderPass(DisplacementShader({
			strength: { x: 0, y: 0.1 }
		}));
		const simpleChokerPass = new ShaderPass(SimpleChokerShader);
		simpleChokerPass.uniforms.threshold.value = 1.0;
		const afterImagePass_Thin = new CustomAfterimagePass(0.99, 0.95);
		const fractalWipeAlphaMatte = new ShaderPass(AlphaInvertedMatteShader({}));
		const noiseMultiplyPass = new ShaderPass(MultiplyShader);
		const noiseAdditivePass = new ShaderPass(AdditiveShader);

		const fractalWipeSavePass = new SavePass(fractalWipeFBO);
		const burntSavePass = new SavePass(burntFBO);
		const readPixelSavePass = new SavePass(readPixelFBO);

		const paperFillPass = new ShaderPass(ColorFillShader("ivory"));
		const burningFillPass = new ShaderPass(ColorFillShader("red"));

		const fractalWipeLayer = new ShaderPass(AppendTextureShader);
		const burningPartLayer = new ShaderPass(AppendTextureShader);

		const fireRenderPass = new RenderPass(fireScene, fireCamera);
		const fireChokerPass = new ShaderPass(SimpleChokerShader);
		fireChokerPass.uniforms.threshold.value = 0.001;
		const fireSavePass = new SavePass(fireFBO);
		const fireLayer = new ShaderPass(AppendTextureShader);

		// render fractal noise and save
		composer.addPass(noisePass);
		composer.addPass(noiseSavePass);

		// render plane white mesh
		composer.addPass(renderPass);

		// render fractal wipe and save
		composer.addPass(paperFillPass);
		composer.addPass(linearWipePass);
		composer.addPass(displacementPass);
		composer.addPass(simpleChokerPass);
		composer.addPass(scalePass);
		composer.addPass(fractalWipeSavePass);

		// render burning part and save
		composer.addPass(fractalWipeLayer);
		composer.addPass(afterImagePass_Thin);
		composer.addPass(fractalWipeAlphaMatte);
		composer.addPass(burningFillPass);
		composer.addPass(noiseMultiplyPass);
		composer.addPass(burntSavePass);

		// read visible pixels
		composer.addPass(burningPartLayer);
		composer.addPass(readPixelPass);
		composer.addPass(readPixelSavePass);

		// render fire scene
		composer.addPass(fireRenderPass);

		const iterations = 8;
		const strength = 0.5;
		for (let i = 0; i < iterations; i += 1) {
			const radius = (iterations - i - 1) * strength;
			const blurPass = new ShaderPass(GaussianBlurShader);
			blurPass.uniforms.direction.value = i % 2 === 0
				? { x: radius, y: 0 }
				: { x: 0, y: radius };
			composer.addPass(blurPass);
		}

		composer.addPass(displacementPass);
		composer.addPass(fireChokerPass);
		composer.addPass(burningFillPass);
		composer.addPass(noiseMultiplyPass);
		composer.addPass(fireSavePass);

		// composer basic burning scene
		composer.addPass(clearPass);
		composer.addPass(fractalWipeLayer);
		composer.addPass(burningPartLayer);

		// append fire scene
		composer.addPass(fireLayer);

		let particles: { [key: string]: Particle } = {};

		function generateParticle(x: number, y: number, z: number) {
			let scaleX = 1;
			let scaleY = gl.drawingBufferWidth / gl.drawingBufferHeight;
			const random = Math.random();
			const scaleRandomness = 0.5;
			scaleX *= (1 - scaleRandomness) + random * scaleRandomness;
			scaleY *= (1 - scaleRandomness) + random * scaleRandomness;

			const size = 0.1;
			const geometry = new THREE.PlaneGeometry(size, size);
			geometry.scale(scaleX, scaleY, 1);
			const material = new THREE.MeshBasicMaterial({
				map: fireTexture,
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
				duration: 1000,
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

		animation.current = animate({
			from: 0,
			to: 1,
			ease: Easing.linear,
			repeat: Infinity,
			repeatType: "loop",
			duration: 20000,
			onUpdate(latest) {
				const burningPixels = getBurningPixels()

				// scalePass.uniforms.scale.value = latest;
				noisePass.uniforms.evolution.value += 0.001;
				linearWipePass.uniforms.angle.value = 90 + Math.sin(latest * 360 * Math.PI / 180) * 15;
				linearWipePass.uniforms.progress.value = latest * 1.1;
				displacementPass.uniforms.map.value = noiseFBO.texture;
				noiseAdditivePass.uniforms.map.value = noiseFBO.texture;
				noiseMultiplyPass.uniforms.map.value = noiseFBO.texture;
				fractalWipeAlphaMatte.uniforms.map.value = fractalWipeFBO.texture;

				fractalWipeLayer.uniforms.map.value = fractalWipeFBO.texture;
				burningPartLayer.uniforms.map.value = burntFBO.texture;

				fireLayer.uniforms.map.value = fireFBO.texture;

				// fire particle
				requestAnimationFrame((time) => {
					const shouldRender = Math.random() > 0.8;
					if (burningPixels.length && shouldRender) {
						const randomPixel = burningPixels[Math.floor(Math.random() * (burningPixels.length - 1))];
						const { x, y } = randomPixel;
						generateParticle(
							x - spreadX * 0.5 + Math.random() * spreadX,
							y - spreadY * 0.5 + Math.random() * spreadY,
							0
						);
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
								particle.velocity.x += (-0.5 + Math.random()) * 0.01;
								// @ts-ignore
								particle.mesh.material.opacity *= 0.92;
							}
						}
					})
				})

				composer.render();
				gl.endFrameEXP();
			}
		})

		function getBurningPixels() {
			readPixelPass.uniforms.random.value = Math.random();
			const pixels = new Uint8Array(gl.drawingBufferWidth * 2 * 4);
			renderer.readRenderTargetPixels(readPixelFBO, 0, 0, gl.drawingBufferWidth, 2, pixels);
			const pixelObjs: { x: number, y: number }[] = [];
			const sliceLength = 4;
			for (let i = 0; i < pixels.length; i += sliceLength) {
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
