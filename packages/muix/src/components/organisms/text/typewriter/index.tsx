import React from "react"
import { StyleProp, TextStyle, View, ViewProps } from "react-native"
import { TransitionalText } from "../../../atoms/layout"
import { SpringConfig, Interpolation, SpringValue, useSpring } from "react-spring"

export const Typewriter = (props: TypewriterProps) => {
	const {
		range = [0, 1],
		chunks,
		styles,
		fallbackStyle,
		loop,
		onFinish,
		springConfig = { start: {}, end: {} },
		pingpong,
		duration,
		delayOnEnd = {
			forward: 1000,
			backward: 1000,
		},
		spontaneous,
		..._viewProps
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
		const splitChunkCommonParams = {
			charCounter,
			chunkIndex: i,
			defaultStyles: styles,
			defaultFallback: fallbackStyle,
		}

		if (Array.isArray(chunk)) {
			const chunkBaseArr = chunk
			return chunkBaseArr.map((chunkBase) => {
				return splitChunkBase({
					chunk: chunkBase,
					...splitChunkCommonParams,
				})
			}).flat()
		}

		return splitChunkBase({
			chunk,
			...splitChunkCommonParams,
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
							if (loop && pingpong) fromEndToStart()
							if (loop && !pingpong) fromStartToEnd()
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
		<View {..._viewProps}>
			{flattened.map((line, i) => (
				<View key={i} style={{ flexDirection: "row", flexWrap: "wrap" }}>
					{line.map((char, j) => {
						const range = (() => {
							if (!spontaneous) return [char.flatIndex, char.flatIndex + 1]
							const unit = charCount / line.length
							return [unit * j, unit * (j + 1)]
						})()
						return (
							<TransitionalText
								key={char.flatIndex}
								progress={extendedProgress}
								styles={char.styles}
								fallbackStyle={char.fallbackStyle}
								range={range}
								children={char.text}
								extrapolate={"clamp"}
							/>
						)
					})}
				</View>
			))}
		</View>
	)
}

type SplitChunkBaseParams = {
	chunk: TypewriterChunkBase,
	charCounter: React.MutableRefObject<number>,
	chunkIndex: number,
	defaultStyles: TypewriterProps["styles"],
	defaultFallback: TypewriterProps["fallbackStyle"]
}

function splitChunkBase({
	chunk,
	charCounter,
	chunkIndex,
	defaultStyles: styles,
	defaultFallback,
}: SplitChunkBaseParams) {
	return chunk.value.split("")
		.map((char) => {
			const result = {
				text: char,
				styles: chunk.styles?.map((s, i) => {
					return [styles ? styles[i] : undefined, s]
				}) || styles,
				fallbackStyle: [defaultFallback, chunk.fallbackStyle],
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
  fallbackStyle?: StyleProp<TextStyle>
}

type TypewriterChunk = TypewriterChunkBase | TypewriterChunkBase[]

export type TypewriterProps = ViewProps & {
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
  fallbackStyle?: StyleProp<TextStyle>
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
	spontaneous?: boolean
}