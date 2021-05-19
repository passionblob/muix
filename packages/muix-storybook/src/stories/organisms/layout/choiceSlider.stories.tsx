import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { StoryFn } from "@storybook/addons"
import { View } from 'react-native';
import { ChoiceSlider } from '@monthem/muix';

const ChoiceSliderStory: StoryFn<JSX.Element> = (p) => {
	return (
		<View>
			<ChoiceSlider
				style={{
					height: 300,
					backgroundColor: "blue",
				}}
			/>
		</View>
	)
}

storiesOf("Organisms/Layout", module)
	.add("ChoiceSlider", ChoiceSliderStory)
