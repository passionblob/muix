import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SaturationShader } from './SaturationShader';

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("ParametricGeometry", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 5;

		const scene = new THREE.Scene();
		scene.add(camera);

    const geometry = new THREE.ParametricGeometry((u, v, dest) => {
			u *= Math.PI;
			v *= 2 * Math.PI;

			u = u * 2;
			var x, y, z;
			if (u < Math.PI) {
					x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
					z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
			} else {
					x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
					z = -8 * Math.sin(u);
			}

			y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

			dest = new THREE.Vector3(x, y, z);
		}, 1, 1);

    const material = new THREE.MeshBasicMaterial({
			color: "white",
      // map: await new TextureLoader().loadAsync(require("./tex1.jpg")),
    })

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);

    composer.addPass(renderPass)
    
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
