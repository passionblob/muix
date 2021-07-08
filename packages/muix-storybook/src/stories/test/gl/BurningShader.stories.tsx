import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Image, ScrollView, PanResponder, Dimensions, Constructor, Text, ImageBackground, TextInput, TouchableOpacity, ImageSourcePropType, ImageURISource } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"
import { THREE, Renderer, TextureLoader } from "expo-three"
import ViewShot from "react-native-view-shot"
import WebColors from '@monthem/web-color'

storiesOf("Test/WebGL", module)
	.add("BurningShader", () => <SimpleGLStory />);

//@ts-ignore
global.THREE = global.THREE || THREE

const tex1 = require("./tex1.jpg");
const imgInfo = Image.resolveAssetSource(tex1)
const vertexShader = `
varying vec2 v_uv;

void main() {
	v_uv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const defaultText = `
이 앱은 꽤나 많은 사람들의 흥미를 불러일으킬 수 있을 것이다.
사람들의 반응이 어떨지 심히 기대된다.

일단 계획은 이렇다.

앱의 이름은 "그런 일도 있었지".

"감정지"에 글을 쓰고 나서 "감정지"를 불태워 없앨 수 있다.
시각적 효과를 통해 "없어진다"는 느낌을 극대화하는 것이 소구점이다.
사용자는 다양한 감정지를 구매할 수 있다.
감정지마다 부여된 시각적 효과와 색깔이 다르다.

일단 부정적인 감정이 주요 타겟감정이다. 서로 다른 감정들마다 감정지를 판매하는 것이다.
폰트도 구매할 수 있게 하자.

정리하자면 이렇다.

1. 종이를 없애는 다양한 시각적 효과를 연출한다.
2. 사람들이 없애고 싶어할만한 다양한 감정들, 혹은 기억들을 분류한다.
3. 각각의 감정들마다 그럴싸한 시각적 효과를 부여한다.
4. 얼마나 많은 사람들이 감정을 불태고 있는지를 서버에 저장하고 실시간으로 보여주자. (감정별로도 분류)
5. 감정/기억을 불태우고 나면 적절한 나레이션을 추가한다. (분노의 기억이 점차 희미해지는 것이 느껴집니다.)

다른 아이디어들은 나중에 추가해보자.
`

const SimpleGLStory = () => {
	const viewShotRef = React.useRef<ViewShot>(null);
	const viewRef = React.useRef<View>(null);
	const [text, setText] = React.useState(defaultText);
	const [captured, setCaptured] = React.useState(false);
	const capturedSource = React.useRef({ uri: "", width: 0, height: 0 });

	async function capture() {
		if (viewShotRef.current?.capture) {
			const uri = await viewShotRef.current.capture()
			const { width, height } = await new Promise((resolve) => {
				viewRef.current?.measureInWindow((x, y, width, height) => {
					resolve({ width, height })
				})
			}) as { width: number, height: number }

			capturedSource.current = {
				uri,
				width,
				height,
			}

			setCaptured(true)
		}
	}

	if (!captured) {
		return (
			<ScrollView>
				<TouchableOpacity onPress={capture}>
					<Text style={{ backgroundColor: "white", padding: 10 }}>이미지로 변환하기</Text>
				</TouchableOpacity>
				<ViewShot ref={viewShotRef}>
					<View onLayout={() => { }} ref={viewRef} style={{ width: "100%" }}>
						<ImageBackground
							style={{ width: "100%", minHeight: 150 }}
							resizeMode={"cover"}
							resizeMethod={"resize"}
							source={require("./paper-texture.jpg")}
						>
							<View style={{ padding: 10, paddingBottom: 50 }}>
								<TextInput
									value={text}
									multiline
									onChangeText={(text) => setText(text)}
									style={{ fontFamily: "KCC-eunyoung" }}
								/>
							</View>
						</ImageBackground>
					</View>
				</ViewShot>
			</ScrollView>
		)
	}

	const { width: img_width, height: img_height } = capturedSource.current;
	const img_aspectRatio = img_width / img_height;
	const uniforms = {
		u_image: { value: new TextureLoader().load(capturedSource.current.uri) },
		u_img_size: { value: { x: img_width, y: img_height } },
		u_img_aspectRatio: { value: img_aspectRatio },
		u_resolution: { value: { x: 0, y: 0 } },
		u_aspectRatio: { value: 1 },
	}

	async function onContextCreate(gl: ExpoWebGLRenderingContext) {
		const { drawingBufferHeight: height, drawingBufferWidth: width } = gl
		uniforms.u_resolution.value.x = width;
		uniforms.u_resolution.value.y = height;
		uniforms.u_aspectRatio.value = width / height;

		const renderer = new Renderer({ gl });
		renderer.setClearColor(WebColors.YellowGreen);
		const scene = new THREE.Scene();

		const zoom = 1.0;

		const camera = new THREE.OrthographicCamera(
			-1 / zoom,
			1 / zoom,
			1 / zoom,
			-1 / zoom,
			0.1,
			100
		);
		camera.position.z = 10;
		scene.add(camera)

		const geometrySize = 2;

		const geometry = new THREE.PlaneGeometry(geometrySize, geometrySize);
		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader: `
			uniform sampler2D u_image;
			uniform vec2 u_img_size;
			uniform vec2 u_resolution;

			varying vec2 v_uv;

			void main() {
				vec2 uv = v_uv;
				vec4 color = texture2D(u_image, uv);
				gl_FragColor = color;
			}
			`,
		})

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		renderer.render(scene, camera);
		gl.endFrameEXP();
	}

	return (
		<ScrollView>
			<TouchableOpacity onPress={() => setCaptured(false)}>
				<Text style={{ backgroundColor: "white", padding: 10 }}>변환취소</Text>
			</TouchableOpacity>
			<GLView
				style={{
					width: "100%",
					height: undefined,
					aspectRatio: img_aspectRatio,
				}}
				onContextCreate={onContextCreate}
			/>
		</ScrollView>
	)
}
