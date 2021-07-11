import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
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

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

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

		const geometry = new THREE.PlaneGeometry(2, 2);

		const sceneFBO = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight);
		const noiseFBO = sceneFBO.clone();
		const fractalWipeFBO = sceneFBO.clone();
		const burntFBO = sceneFBO.clone();
		const burningFBO = sceneFBO.clone();
		
		const material = new THREE.MeshBasicMaterial({color: "white"});
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
		
		const composer = new EffectComposer(renderer);
		const linearWipePass = new ShaderPass(LinearWipeShader({
			angle: 90,
			feather: 0.1,
			progress: 0.0
		}));
		
		const clearPass = new ClearPass();

		const noisePass = new ShaderPass(FastNoiseShader);
		const noiseSavePass = new SavePass(noiseFBO);
		const renderPass = new RenderPass(scene, camera);
		const displacementPass = new ShaderPass(DisplacementShader({strength: {x: 0, y: 0.1}}));
		const simpleChokerPass = new ShaderPass(SimpleChokerShader);
		const fractalWipeSavePass = new SavePass(fractalWipeFBO);
		const afterImagePass_Thick = new CustomAfterimagePass(0.99, 0.80);
		const afterImagePass_Thin = new CustomAfterimagePass(0.99, 0.86);
		const alphaMattePass = new ShaderPass(AlphaInvertedMatteShader({}));
		const noiseMultiplyPass = new ShaderPass(MultiplyShader);
		const noiseAdditivePass = new ShaderPass(AdditiveShader);
		const burningSavePass = new SavePass(burningFBO);
		const burntSavePass = new SavePass(burntFBO);

		const paperFillPass = new ShaderPass(ColorFillShader("lightgrey"));
		const burningFillPass = new ShaderPass(ColorFillShader("red"));
		const burntFillPass = new ShaderPass(ColorFillShader("rgba(80, 80, 80, 1)"));

		const fractalWipeLayer = new ShaderPass(AppendTextureShader);
		const burningPartLayer = new ShaderPass(AppendTextureShader);
		const burntPartLayer = new ShaderPass(AppendTextureShader);

		const burningPatLayerAdditivePass = new ShaderPass(AdditiveShader);
		
		// render fractal noise and save
		composer.addPass(noisePass);
		composer.addPass(noiseSavePass);

		// render plane white mesh
		composer.addPass(renderPass);
		
		// render fractal wipe and save
		composer.addPass(linearWipePass);
		composer.addPass(displacementPass);
		composer.addPass(simpleChokerPass);
		composer.addPass(paperFillPass);
		composer.addPass(fractalWipeSavePass);

		// render burning part and save
		composer.addPass(afterImagePass_Thick);
		composer.addPass(alphaMattePass);
		composer.addPass(simpleChokerPass);
		composer.addPass(burningFillPass);
		composer.addPass(noiseMultiplyPass);
		composer.addPass(burningSavePass);

		// render burnt part and save
		composer.addPass(clearPass);
		composer.addPass(fractalWipeLayer);
		composer.addPass(afterImagePass_Thin);
		composer.addPass(alphaMattePass);
		composer.addPass(simpleChokerPass);
		composer.addPass(burntFillPass);
		composer.addPass(noiseMultiplyPass);
		composer.addPass(burntSavePass);

		// append fractal wipe and burn
		composer.addPass(fractalWipeLayer);

		composer.addPass(burningPartLayer);
		composer.addPass(burningPatLayerAdditivePass);

		composer.addPass(burntPartLayer);

		animation.current = animate({
			from: 0, 
			to: 1,
			ease: Easing.linear,
			repeat: Infinity,
			repeatType: "loop",
			duration: 40000,
			onUpdate(latest) {
				linearWipePass.uniforms.angle.value = 90 + Math.sin(latest * 360 * Math.PI / 180) * 15;
				linearWipePass.uniforms.progress.value = latest * 1.1;
				displacementPass.uniforms.map.value = noiseFBO.texture;
				noiseAdditivePass.uniforms.map.value = noiseFBO.texture;
				noiseMultiplyPass.uniforms.map.value = noiseFBO.texture;
				alphaMattePass.uniforms.map.value = fractalWipeFBO.texture;

				fractalWipeLayer.uniforms.map.value = fractalWipeFBO.texture;
				burntPartLayer.uniforms.map.value = burntFBO.texture;
				burningPartLayer.uniforms.map.value = burningFBO.texture;

				burningPatLayerAdditivePass.uniforms.map.value = burningFBO.texture;

				composer.render();
				gl.endFrameEXP();
			}
		})

	}

	React.useEffect(() => {
		return () => {
			animation.current?.stop()
		}
	}, [])

	return (
		<ScrollView>
			<GLView
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: 3 / 4,
					backgroundColor: "transparent"
				}}
				onContextCreate={onContextCreate}
			/>
		</ScrollView>
	)
}
