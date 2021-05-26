import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Typewriter } from '@monthem/muix/src';


const chunks1 = [
	{
		value: "This is a typewriter ", styles: [
			{ color: "lightgrey" },
			{ color: "blue" },
		]
	},
	[
		{
			value: "Which ", styles: [
				{ transform: [{ translateY: -10 }] },
				{ transform: [{ translateY: 0 }] },
			]
		},
		{
			value: "enables ", styles: [
				{ color: "lightgrey" },
				{ color: "red" },
			]
		},
		{
			value: "seperate ", styles: [
				{ transform: [{ scaleX: 0 }] },
				{ transform: [{ scaleX: 1 }] },
			]
		},
		{
			value: "styling", styles: [
				{ color: "white", backgroundColor: "black" },
				{ color: "black", backgroundColor: "gold" }
			]
		},
	],
	{
		value: " for each characters.", styles: [
			{ fontSize: 12 },
			{ fontSize: 24 },
		]
	},
]


const chunks2 = [
	{ value: "This is another example, " },
	{ value: "which is animating font size and color " },
	{ value: "for all chunks." },
]

const example = [chunks1, chunks2]
const exampleStyles: StyleProp<TextStyle>[][] = [
	[
		{opacity: 0},
		{opacity: 1}
	],
	[
		{opacity: 0, fontSize: 12, color: "black"},
		{opacity: 1, fontSize: 30, color: "blue"}
	]
]

const TypeWriterStory = () => {
	const [chunkIndex, setChunkIndex] = React.useState(0)

	const flattendIndex = chunkIndex % example.length

	return (
		<View>
			<Typewriter
				// progress={spring.progress}
				loop
				pingpong
				springConfig={{
					start: {duration: 5000},
					end: {duration: 1000}
				}}
				styles={exampleStyles[flattendIndex]}
				onFinish={(position) => {
					if (position === "start") {
						setChunkIndex(chunkIndex + 1)
					}
				}}
				chunks={example[flattendIndex]}
			/>
		</View>
	)
}

storiesOf("Atoms/Text", module)
	.add("Typewriter", () => <TypeWriterStory />)
