import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Interpolation, SpringConfig, SpringValue } from '@react-spring/core';
import { TransitionalText } from '@monthem/muix/src';
import Slider from '@react-native-community/slider';
import { useSpring } from 'react-spring';

const Typewriter = (props: TypewriterProps) => {
	const {
		range = [0, 1],
		chunks,
		styles,
		loop,
		onFinish,
		springConfig = { start: {}, end: {} },
		pingpong,
		duration,
		delayOnEnd = {
			forward: 1000,
			backward: 1000,
		}
	} = props

	const [spring, api] = (() => {
		if (props.progress) return [{ progress: props.progress }, null] as const
		const [spring, api] = useSpring(() => ({
			progress: 0
		}))
		return [spring, api] as const
	})()

	const shouldWait = React.useRef(false);
	const timeout = React.useRef<number>()

	const charCounter = React.useRef(0)
	charCounter.current = 0

	const flattened = chunks.map((chunk, i) => {
		if (Array.isArray(chunk)) {
			const chunkBaseArr = chunk
			return chunkBaseArr.map((chunkBase) => {
				return splitChunkBase({
					chunk: chunkBase,
					charCounter,
					chunkIndex: i,
					defaultStyle: styles,
				})
			}).flat()
		}

		return splitChunkBase({
			chunk,
			charCounter,
			chunkIndex: i,
			defaultStyle: styles,
		})
	})

	const charCount = flattened.reduce((acc, ele) => acc.concat(ele)).length

	const extendedProgress = spring.progress.to({
		range,
		output: [0, charCount]
	})

	React.useEffect(() => {
		if (props.progress === undefined) {
			const fromStartToEnd = () => {
				const delay = shouldWait.current ? delayOnEnd.backward : 0
				shouldWait.current = false

				timeout.current = setTimeout(() => {
					api?.start({
						from: { progress: 0 },
						to: { progress: 1 },
						config: { duration, ...springConfig.start },
						onResolve: () => {
							shouldWait.current = true
							if (onFinish) onFinish("end")
							fromEndToStart()
						},
					})					
				}, delay)
			}

			const fromEndToStart = () => {
				const delay = shouldWait.current ? delayOnEnd.forward : 0
				shouldWait.current = false

				timeout.current = setTimeout(() => {
					api?.start({
						from: { progress: 1 },
						to: { progress: 0 },
						config: { duration, ...springConfig.end },
						onResolve: () => {
							shouldWait.current = true
							if (onFinish) onFinish("start")
							fromStartToEnd()
						},
					})
				}, delay)
			}

			fromStartToEnd()
		}

		return () => {
			if (timeout.current !== undefined) {
				clearTimeout(timeout.current)
			}
		}
	}, [onFinish])

	return (
		<View>
			{flattened.map((line, i) => (
				<View key={i} style={{ flexDirection: "row" }}>
					{line.map((char) => (
						<TransitionalText
							key={char.flatIndex}
							progress={extendedProgress}
							styles={char.styles}
							range={[char.flatIndex, char.flatIndex + 1]}
							children={char.text}
							extrapolate={"clamp"}
						/>
					))}
				</View>
			))}
		</View>
	)
}

type SplitChunkBaseParams = {
	chunk: TypewriterChunkBase,
	charCounter: React.MutableRefObject<number>,
	chunkIndex: number,
	defaultStyle: TypewriterProps["styles"],
}
function splitChunkBase({
	chunk,
	charCounter,
	chunkIndex,
	defaultStyle: styles,
}: SplitChunkBaseParams) {
	return chunk.value.split("")
		.map((char) => {
			const result = {
				text: char,
				styles: chunk.styles?.map((s, i) => {
					return [styles ? styles[i] : undefined, s]
				}) || styles,
				chunkIndex,
				flatIndex: charCounter.current
			}

			charCounter.current += 1;

			return result
		})
}

type TypewriterChunkBase = {
	value: string
	styles?: StyleProp<TextStyle>[]
}

type TypewriterChunk = TypewriterChunkBase | TypewriterChunkBase[]

export type TypewriterProps = {
	chunks: TypewriterChunk[]
	/**
	 * specify progress range
	 * works only when progress is provided.
	 */
	range?: number[]
	/**
	 * styles is applied globally
	 */
	styles?: StyleProp<TextStyle>[]
	progress?: SpringValue<number> | Interpolation<any, number>
	/**
	 * duration in ms
	 */
	loop?: boolean
	/**
	 * works only when progress is not provided.
	 * this is called when internal spring finishes its move.
	 * if loop=true, called on end of every loop
	 */
	onFinish?: (position: "start" | "end") => void
	pingpong?: boolean
	duration?: number
	delayOnEnd?: {
		forward?: number
		backward?: number
	}
	springConfig?: {
		start?: SpringConfig,
		end?: SpringConfig,
	}
}

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
		{fontSize: 12, color: "black"},
		{fontSize: 30, color: "blue"}
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
