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
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader"
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader"
import { TriangleBlurShader } from "three/examples/jsm/shaders/TriangleBlurShader"
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { GaussianBlurShader } from './GaussianBlurShader';

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
]

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("Blur", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

		const geometry = new THREE.PlaneGeometry(2, 2);
		
		const material = new THREE.MeshBasicMaterial({
      map: textures[0]
    })

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

    const composer = new EffectComposer(renderer);
    
    const renderPass = new RenderPass(scene, camera);
		const iterations = 8;
		const strength = 2.0;
    composer.addPass(renderPass);
		for (let i = 0; i < 8; i += 1) {
			const radius = (iterations - i - 1) * strength;
			const blurPass = new ShaderPass(GaussianBlurShader);
			blurPass.uniforms.direction.value = i % 2 === 0
				? {x: radius, y: 0}
				: {x: 0, y: radius};
			composer.addPass(blurPass);
		}

    composer.render();
    gl.endFrameEXP();
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
