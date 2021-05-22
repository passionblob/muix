import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, View } from 'react-native';
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

const ChoiceSliderStory = () => {
	return (
		<View>
			<ChoiceSlider
				alignChunks={"center"}
				vertical
				auto
				autoInterval={1000}
				style={{
					height: 300,
					backgroundColor: WebColors.AliceBlue,
					borderWidth: 1,
				}}
				choices={choices}
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
				choices={choices}
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
