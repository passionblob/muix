import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChoiceSlider } from '@monthem/muix';
import WebColors from '@monthem/web-color';

const choices = Array(3000).fill(0).map((_, i) => {
	return [
		"This is a choice slider",
		"made with carouselBase",
		[
			{ value: `This is choice ${i}.`, props: { primary: true } },
			"and",
			{ value: `Next is choice ${i + 1}.`, props: { primary: true } },
		]
	]
})

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
