import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChoiceSlider } from '@monthem/muix';
import WebColors from '@monthem/web-color';

const choices = [
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
]

const largeChoices = Array(1000).fill(0).map(() => choices.slice(0)).reduce((acc, ele) => acc.concat(ele))

const ChoiceSliderStory = () => {
	const sliderRef = React.useRef<ChoiceSlider>(null)

	return (
		<View>
			<ChoiceSlider
				ref={sliderRef}
				alignChunks={"center"}
				vertical
				auto
				autoInterval={1000}
				style={{
					height: 300,
					backgroundColor: WebColors.AliceBlue,
					borderWidth: 1,
				}}
				choices={largeChoices}
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
			<ChoiceSlider
				alignChunks={"center"}
				auto
				autoInterval={1000}
				style={{
					height: 300,
					backgroundColor: WebColors.Beige,
					borderWidth: 1,
				}}
				choices={largeChoices}
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
