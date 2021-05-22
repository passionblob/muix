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
				chunkInterpolator={({}) => {
					return {
						translateX: [-50, 0, 50],
						translateY: [100, 0, 100],
					}
				}}
				microChunkInterpolator={({ info, chunkIndex, chunks, item, props }) => {
					const color = props.primary ? "blue" : "black"
					const fontWeight = props.primary ? "700" : "400"
					return {
						opacity: [0, 1, 0],
						fontSize: [5, 20, 5],
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
