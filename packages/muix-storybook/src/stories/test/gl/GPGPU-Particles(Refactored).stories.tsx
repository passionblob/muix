import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource, NativeTouchEvent, GestureResponderEvent, LayoutRectangle } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { CustomAfterimagePass } from './CustomAfterimagePass';
import {GPGPUParticle} from "./GPGPUParticle"

storiesOf("Test/WebGL", module)
	.add("GPGPU-Particles(Refactor)", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const SimpleGLStory = () => {
	const animation = React.useRef({stop() {}});
	const layout = React.useRef<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });
	const gpgpuParticleRef = React.useRef<GPGPUParticle>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({gl});
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		camera.position.set(0, 0, 10);
		
		// 지금은 const로 변수들을 처리하고 있지만 uniform으로 처리하면 동적으로 변화를 줄 수 있다.
		const gpgpuParticle = new GPGPUParticle({
			renderer,
			size: 0.05,
			rate: 8,
			sizeRandomiser: 0.00,
			sprayCone: 30,
			angle: 90,
			lifetime: 1000,
			growRate: -0.05,
			growRateRandomiser: 0.00,
			xRandomiser: 0.1,
			yRandomiser: 0.1,
			initialOpacity: 0.0,
			opacityRate: 1.0,
			initialVelocity: 0.15,
			acc: 0.15,
			gravity: 0.0,
			angleRandomiser: 30,
			whirlAngle: 30,
			whirlDiversion: true,
			hueRandomiser: 1.0,
			lightnessRandomiser: 0.0,
		});
		gpgpuParticleRef.current = gpgpuParticle;
		
		scene.add(gpgpuParticle);

		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene, camera);
		const testPass = new TexturePass(gpgpuParticle.toggleFBO.texture);
		const afterImagePass = new CustomAfterimagePass();

		composer.addPass(renderPass);
		composer.addPass(afterImagePass);
		// composer.addPass(testPass);

		let shouldStop = false;
		animation.current.stop = () => {shouldStop = true};

		function tick(time: number) {
			if (shouldStop) return;
			gpgpuParticle.compute();
			composer.render();
			gl.endFrameEXP();
			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderMove: (e) => {
			const {locationX, locationY, timestamp} = e.nativeEvent;
			let x = locationX / layout.current.width;
			let y = locationY / layout.current.height;
			y *= 2.0;
			y -= 1.0;
			y *= -1.0;
			y += 1.0;
			y /= 2.0;

			gpgpuParticleRef.current?.emit(x, y);
		},
	})

	React.useEffect(() => {
		return () => {
			animation.current.stop();
		}
	}, []);

	return (
		<ScrollView>
			<GLView
				onLayout={(e) => {layout.current = e.nativeEvent.layout}}
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: 1 / 1,
					backgroundColor: "black",
				}}
				{...panResponder.panHandlers}
				onContextCreate={onContextCreate}
			/>
			<Text
				style={{
					color: "white",
					backgroundColor: "black",
					fontSize: 20,
					padding: 10,
					marginTop: 10
				}}>
				touch area to generate particles.
			</Text>
		</ScrollView>
	)
}