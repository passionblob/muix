import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { animate } from 'popmotion';
import { FBMNoiseShader } from './FBMNoiseShader';
import { DisplacementShader } from './DisplacementShader';

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("Dispacement", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const noiseScene = new THREE.Scene();
		noiseScene.add(camera);

		const scene = new THREE.Scene();
		scene.add(camera);

		const geometry = new THREE.PlaneGeometry(2, 2);

		const noiseFBO = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight);
		const noiseMaterial = new THREE.ShaderMaterial(FBMNoiseShader({
			scale: 0.5,
			velocity: {
				x: -10,
				y: -10,
			}
		}))
		const noiseMesh = new THREE.Mesh(geometry, noiseMaterial);
		noiseScene.add(noiseMesh);
		
		const material = new THREE.ShaderMaterial(DisplacementShader)
		material.uniforms.tDiffuse.value = textures[0];
		material.uniforms.map.value = noiseFBO.texture;
		material.uniforms.strength.value = {x: 0.5, y: 0.5};

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		animation.current = animate({
			from: 0, 
			to: 1,
			repeat: Infinity,
			repeatType: "reverse",
			duration: 2000,
			onUpdate(latest) {
				noiseMaterial.uniforms.evolution.value += 1;
				renderer.setRenderTarget(noiseFBO);
				renderer.render(noiseScene, camera);
				renderer.setRenderTarget(null);
				renderer.render(scene, camera);
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
					aspectRatio: 1 / 1,
					backgroundColor: "transparent"
				}}
				onContextCreate={onContextCreate}
			/>
		</ScrollView>
	)
}
