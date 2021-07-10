import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FBMNoiseShader } from './FBMNoiseShader';

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("FBMNoise", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

    const composer = new EffectComposer(renderer);
    const noisePass = new ShaderPass(FBMNoiseShader({
      scale: 0.5,
      velocity: {
        x: 10,
        y: -10,
      }
    }));

    composer.addPass(noisePass);
    
    let shouldStop = false;
    animation.current = {
      stop() {
        shouldStop = true;
      }
    }

    function tick(time: number) {
      if (shouldStop) return;
      noisePass.uniforms.evolution.value += 1;
      composer.render();
      gl.endFrameEXP();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick)
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
