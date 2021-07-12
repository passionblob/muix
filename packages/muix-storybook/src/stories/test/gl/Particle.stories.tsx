import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, ScrollView } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { animate } from 'popmotion';
import { FastNoiseShader } from './FastNoiseShader';

const fireTexture = new TextureLoader().load(require("./fire_texture.jpg"));

//@ts-ignore
global.THREE = global.THREE || THREE

storiesOf("Test/WebGL", module)
	.add("Particle", () => <SimpleGLStory />);

class Particle {
	id: THREE.Mesh["id"]
	velocity = {x: 0, y: 0, z: 0};
	appeared = false;
	constructor(
		public mesh: THREE.Mesh,
	) {
		this.id = this.mesh.id
	}
}

const SimpleGLStory = () => {
	const animation = React.useRef<{ stop: () => void }>();

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const renderer = new Renderer({ gl });

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera.position.z = 2;

		const scene = new THREE.Scene();
		scene.add(camera);

		let particles: {[key: string]: Particle} = {};
		const group = new THREE.Group();
		scene.add(group);

		const geometry = new THREE.PlaneGeometry(2, 2);
		const material = new THREE.MeshBasicMaterial({color: "black"})
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		function generateParticle(x: number, y: number, z: number) {
			let scaleX = 1;
			let scaleY = gl.drawingBufferWidth / gl.drawingBufferHeight;
			const random = Math.random();
			const scaleRandomness = 0.5;
			scaleX *= (1 - scaleRandomness) + random * scaleRandomness;
			scaleY *= (1 - scaleRandomness) + random * scaleRandomness;

			const geometry = new THREE.PlaneGeometry(1, 1);
			geometry.scale(scaleX, scaleY, 1);
			const material = new THREE.MeshBasicMaterial({
				map: fireTexture,
				blending: THREE.AdditiveBlending,
			})

			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(x, y, z);

			scene.add(mesh);
			group.add(mesh);

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
				duration: 100,
				onUpdate(latest) {
					material.opacity += 0.01;
					mesh.scale.set(latest, latest, latest);
				},
				onComplete() {
					particle.appeared = true;
				}
			})
		}

		let shouldStop = false;
		animation.current = {
			stop() {
				shouldStop = true;
			}
		}

		const particlesPerSec = 100;
		const x = 0;
		const y = -1;
		const spreadX = 0.2;
		const spreadY = 0.05;
		let lastSpawnTimeStamp = 0;
		function tick(time: number) {
			if (shouldStop) return;

			if (time - lastSpawnTimeStamp > (1000 / particlesPerSec)) {
				generateParticle(
					x - spreadX * 0.5 + Math.random() * spreadX,
					y - spreadY * 0.5 + Math.random() * spreadY,
					0
				);
				lastSpawnTimeStamp = time;
			}

			Object.values(particles).forEach((particle) => {
				const {mesh, id} = particle;
				const shouldRemove =
					particle.appeared &&
					(
						mesh.scale.x <= 0.001
						|| mesh.scale.y <= 0.001
						|| mesh.material.opacity <= 0.1
					);
				if (shouldRemove) {
					scene.remove(mesh);
					group.remove(mesh);
					delete particles[id];
				} else {
					// group.position.x = Math.sin(time * 0.001);
					particle.velocity.x += (-0.5 + Math.random()) * 0.003;
					particle.velocity.y += Math.random() * 0.003;
					particle.mesh.position.x += particle.velocity.x;
					particle.mesh.position.y += particle.velocity.y;
					particle.mesh.scale.x *= 0.97;
					particle.mesh.scale.y *= 0.97;

					if (particle.appeared) {
						// @ts-ignore
						particle.mesh.material.opacity *= 0.95;
					}
				}
			})

			renderer.render(scene, camera);
			gl.endFrameEXP();
			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
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
