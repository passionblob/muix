import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { animate } from 'popmotion';
import { FastNoiseShader } from './FastNoiseShader';

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("FastNoise", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

    const composer = new EffectComposer(renderer);
    const noisePass = new ShaderPass(FastNoiseShader);

    composer.addPass(noisePass);

    animate({
      from: 0,
      to: 1,
      duration: 10000,
      onUpdate() {
        noisePass.uniforms.evolution.value -= 0.01;
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
