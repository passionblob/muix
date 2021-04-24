import { Animated } from "react-native"
import { keysOf } from "../../../muix-components/src/utils"
import {
	interpolateNumber,
	makeRecords,
	mapNumberToAnimated,
	returnNext
} from "./common"

import {
	interpolateColor,
	interpolateLength,
	interpolateLayout,
	mapColorToAnimated,
	mapLengthToAnimated,
	mapLayoutToAnimated
} from "./style"

import {
	interpolateTransform,
	interpolateMatrix,
	mapTransformToAnimated,
	mapMatrixToAnimated
} from "./transform"

type TransitionalInterpolatorProps<T> = {
	default?: T
	properties: {
		color: string[],
		number: string[],
		length: string[],
		layout: string[],
		nonInterpolable: string[],
	}
}

export class TransitionalInterpolator<T extends Record<any, any>> {
	props: TransitionalInterpolatorProps<T>

	styleInterpolator: {
		[key in NonNullable<keyof Animated.AnimatedProps<T>>]: (
			prev?: T[key],
			next?: T[key],
			ratio?: number
		) => T[key]
	}

	animatedStyleMapper: {
		[key in NonNullable<keyof Animated.AnimatedProps<T>>]: (
			prev?: T[key],
			next?: T[key],
			animatedValue?: Animated.Value
		) => Animated.WithAnimatedValue<T[key]> | T[key]
	}

	constructor(props: TransitionalInterpolatorProps<T>) {
		this.props = props
		this.styleInterpolator = {
			...makeRecords(props.properties.color, interpolateColor),
			...makeRecords(props.properties.number, interpolateNumber),
			...makeRecords(props.properties.length, interpolateLength),
			...makeRecords(props.properties.nonInterpolable, returnNext),
			...makeRecords(props.properties.layout, interpolateLayout),
			transform: interpolateTransform,
			transformMatrix: interpolateMatrix,
		} as any

		this.animatedStyleMapper = {
			...makeRecords(props.properties.color, mapColorToAnimated),
			...makeRecords(props.properties.number, mapNumberToAnimated),
			...makeRecords(props.properties.length, mapLengthToAnimated),
			...makeRecords(props.properties.nonInterpolable, returnNext),
			...makeRecords(props.properties.layout, mapLayoutToAnimated),
			transform: mapTransformToAnimated,
			transformMatrix: mapMatrixToAnimated,
		} as any
	}

	getDefaultValue = <T>(key: keyof T) => {
		return this.props.default && this.props.default[key]
	}

	getInterpolatedStyle = <T>(
		prevStyle: T,
		nextStyle: T,
		ratio: number
	): T => {
		const { getDefaultValue } = this
		return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
			const prevValue = prevStyle[key] || getDefaultValue(key)
			const nextValue = nextStyle[key] || getDefaultValue(key)
			acc[key] = (this.styleInterpolator as any)[key](prevValue, nextValue, ratio)
			return acc
		}, {} as T)
	}

	getTransitionalStyle = <T>(
		prevStyle: T,
		nextStyle: T,
		anim: Animated.Value,
	): Animated.AnimatedProps<T> => {
		const { getDefaultValue } = this
		return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
			const prevValue = prevStyle[key] || getDefaultValue(key)
			const nextValue = nextStyle[key] || getDefaultValue(key)
			acc[key] = (this.animatedStyleMapper as any)[key](prevValue, nextValue, anim)
			return acc
		}, {} as Animated.AnimatedProps<T>)
	}
}
