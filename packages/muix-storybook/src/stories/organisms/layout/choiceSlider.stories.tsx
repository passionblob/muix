import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, View } from 'react-native';
import { ChoiceSlider } from '@monthem/muix';

const ChoiceSliderStory = () => {
	return (
		<View>
			<ChoiceSlider
				alignChunks={"center"}
				style={{
					height: 300,
					backgroundColor: "lightgrey",
				}}
				choices={[
					[
						"I usually",
						"have been",
						[
							{ value: "imaginative", props: { primary: true } },
							"and",
							{ value: "romatic", props: { primary: true } },
						]
					],
					["I usually", "have been", { value: "pragmatic and realistic" }],
					["I usually", "have been", { value: "no no no no no no no no" }],
				]}
				chunkInterpolator={({info}) => {
					return {
						translateX: [-50, 0, 50],
						translateY: [info.layout.height * 0.2, 0, info.layout.height * 0.2],
						opacity: [0, 1, 0],
						scale: [0.2, 1, 0.2],
						rotateY: ["-180deg", "0deg", "180deg"],
					}
				}}
				microChunkInterpolator={({ info, chunkIndex, chunks, item, props }) => {
					const color = props.primary ? "blue" : "black"
					const fontWeight = props.primary ? "700" : "400"
					return {
						fontSize: 20,
						color: ["grey", color, "grey"],
						fontWeight: fontWeight,
					}
				}}
			/>
		</View>
	)
}

storiesOf("Organisms/Layout", module)
	.add("ChoiceSlider", () => <ChoiceSliderStory />)
