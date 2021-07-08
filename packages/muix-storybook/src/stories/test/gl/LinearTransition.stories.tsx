import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { animate } from 'popmotion';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { LinearTransitionShader } from './LinearTransitionShader';

const textures = [
	new TextureLoader().load(require("./tex1.jpg")),
	new TextureLoader().load(require("./tex2.jpg")),
	new TextureLoader().load(require("./tex3.jpg")),
	new TextureLoader().load(require("./tex4.jpg")),
	new TextureLoader().load(require("./tex5.jpg")),
]

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("LinearTransition", () => <SimpleGLStory />);

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();
	const textureIndex = React.useRef(0);

	function next() {
		if (textureIndex.current < textures.length - 1) {
			textureIndex.current += 1;
		} else {
			textureIndex.current = 0;
		}

		return textures[textureIndex.current]
	}

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

		const material = new THREE.MeshBasicMaterial({
			map: textures[0]
		})

		const geometry = new THREE.PlaneGeometry(2, 2);
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
		
		const composer = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera)
		const linearTransitionPass1 = new ShaderPass(LinearTransitionShader({
			angle: 45,
			progress: 1,
		}));

		const linearTransitionPass2 = new ShaderPass(LinearTransitionShader({
			angle: 225,
			progress: 1,
		}));
		
		composer.addPass(renderPass);
		composer.addPass(linearTransitionPass1);
		composer.addPass(linearTransitionPass2);

		let repeatCount = 0;

		animation.current = animate({
			from: 0, 
			to: 1,
			repeat: Infinity,
			repeatType: "reverse",
			duration: 500,
			onRepeat() {
				repeatCount += 1;

				if (repeatCount % 2 === 1) {
					material.map = next();
				}
			},
			onUpdate(latest) {
				linearTransitionPass1.uniforms.angle.value += 1;
				linearTransitionPass2.uniforms.angle.value += 1;
				linearTransitionPass1.uniforms.progress.value = 1 - latest * 0.5;
				linearTransitionPass2.uniforms.progress.value = 1 - latest * 0.5;
				composer.render();
				gl.endFrameEXP();
			}
		})

	}

	React.useEffect(() => {
		return () => {
			animation.current?.stop()
		}
	})

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
