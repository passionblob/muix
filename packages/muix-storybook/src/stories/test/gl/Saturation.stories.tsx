import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { animate } from 'popmotion';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { LinearWipeShader } from './LinearWipeShader';
import { FBMNoiseShader } from './FBMNoiseShader';
import { SaturationShader } from './SaturationShader';

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("Saturation", () => <SimpleGLStory />);

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
      map: await new TextureLoader().loadAsync(require("./tex1.jpg")),
    })
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const saturationPass = new ShaderPass(SaturationShader({
      amount: 0
    }));

    composer.addPass(renderPass)
		composer.addPass(saturationPass)
    
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
