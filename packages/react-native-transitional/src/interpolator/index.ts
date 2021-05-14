import { Animated, ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native"
import { keysOf } from "@monthem/utils"
import { StyleHolder, StyleHolderOf, StyleInterpolator, AnimatedStyleMapper } from "../types"
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
	styleInterpolator: StyleInterpolator<T>
	animatedStyleMapper: AnimatedStyleMapper<T>

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
			const prevValue = prevStyle[key] === undefined ? getDefaultValue(key) : prevStyle[key]
			const nextValue = nextStyle[key] === undefined ? getDefaultValue(key) : nextStyle[key]
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
			const prevValue = prevStyle[key] === undefined ? getDefaultValue(key) : prevStyle[key]
			const nextValue = nextStyle[key] === undefined ? getDefaultValue(key) : nextStyle[key]
			acc[key] = (this.animatedStyleMapper as any)[key](prevValue, nextValue, anim)
			return acc
		}, {} as Animated.AnimatedProps<T>)
	}
}

export const createStyleHolder = <T>(): StyleHolder<T> => ({
	prev: undefined,
	cur: undefined,
	next: undefined
})


export function getTransitionalStyles<OriginalProps>(params: {
	styleHolder: StyleHolderOf<OriginalProps>,
	targets: (keyof StyleHolderOf<OriginalProps>)[],
	props: OriginalProps,
	interpolator: TransitionalInterpolator<any>,
	progress: number,
	anim: Animated.Value,
}) {
	const {
		anim,
		interpolator,
		progress,
		props,
		styleHolder,
		targets
	} = params

	const transitionalStyles = {} as any;

	targets.forEach((target) => {
		const flattend = StyleSheet.flatten(props[target]);
		const holder = styleHolder[target]

		if (holder === undefined) return;

		holder.prev = holder.cur

		holder.cur = holder.prev
			? interpolator.getInterpolatedStyle(
				holder.prev,
				holder.next,
				Math.min(progress, 1)
			)
			: flattend

		holder.next = flattend

		transitionalStyles[target] = interpolator.getTransitionalStyle(
			holder.cur,
			holder.next,
			anim
		)
	})

	return transitionalStyles
}


export const textStyleInterpolator = new TransitionalInterpolator<TextStyle>({
  default: {
    opacity: 1,
    fontSize: 10,
  },
  properties: {
    color: [
      "backgroundColor", "borderColor", "borderEndColor",
      "borderLeftColor", "borderRightColor", "borderStartColor",
      "borderTopColor", "color", "textDecorationColor",
      "textShadowColor", "borderBottomColor", "shadowColor",
    ],
    number: [
      "borderRadius", "aspectRatio", "borderTopLeftRadius",
      "borderTopRightRadius", "borderBottomLeftRadius",
      "borderBottomRightRadius", "borderBottomWidth",
      "borderRightWidth", "borderLeftWidth", "borderTopWidth",
      "flex", "flexGrow", "flexShrink", "opacity", "rotation",
      "scaleX", "scaleY", "borderWidth", "shadowOpacity",
      "zIndex", "translateX", "translateY", "shadowRadius",
      "borderBottomEndRadius", "borderBottomStartRadius",
      "borderTopStartRadius", "borderTopEndRadius", "elevation",
      "fontSize", "lineHeight", "textShadowRadius", "letterSpacing",
    ],
    length: [
      "borderStartWidth", "borderEndWidth", "width",
      "height", "margin", "marginBottom", "marginEnd",
      "marginHorizontal", "marginLeft", "marginRight",
      "marginStart", "marginTop", "marginVertical",
      "maxHeight", "maxWidth", "minHeight", "minWidth",
      "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
      "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
      "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
    ],
    nonInterpolable: [
      "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
      "display", "direction", "flexDirection", "flexWrap", "fontFamily",
      "fontStyle", "includeFontPadding", "justifyContent", "overflow",
      "position", "textAlign", "textAlignVertical",
      "textDecorationLine", "textDecorationStyle", "writingDirection",
      "borderStyle", "end", "start", "testID", "fontVariant", "fontWeight",
      "textTransform",
    ],
    layout: [
      "shadowOffset", "textShadowOffset"
    ]
  }
})

export const viewStyleInterpolator = new TransitionalInterpolator<ViewStyle>({
  default: {
    opacity: 1,
  },
  properties: {
    color: [
      "backgroundColor", "borderColor", "borderEndColor",
      "borderLeftColor", "borderRightColor", "borderStartColor",
      "borderTopColor", "borderBottomColor", "shadowColor",
    ],
    number: [
      "borderRadius", "aspectRatio", "borderTopLeftRadius",
      "borderTopRightRadius", "borderBottomLeftRadius",
      "borderBottomRightRadius", "borderBottomWidth",
      "borderRightWidth", "borderLeftWidth", "borderTopWidth",
      "flex", "flexGrow", "flexShrink", "opacity", "rotation",
      "scaleX", "scaleY", "borderWidth", "shadowOpacity",
      "zIndex", "translateX", "translateY", "shadowRadius",
      "borderBottomEndRadius", "borderBottomStartRadius",
      "borderTopStartRadius", "borderTopEndRadius", "elevation",
    ],
    length: [
      "borderStartWidth", "borderEndWidth", "width",
      "height", "margin", "marginBottom", "marginEnd",
      "marginHorizontal", "marginLeft", "marginRight",
      "marginStart", "marginTop", "marginVertical",
      "maxHeight", "maxWidth", "minHeight", "minWidth",
      "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
      "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
      "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
    ],
    nonInterpolable: [
      "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
      "display", "direction", "flexDirection", "flexWrap", "justifyContent", "overflow",
      "position", "borderStyle", "end", "start", "testID",
    ],
    layout: [
      "shadowOffset"
    ]
  }
})

export const imageStyleInterpolator = new TransitionalInterpolator<ImageStyle>({
  default: {
    opacity: 1,
  },
  properties: {
    color: [
      "backgroundColor", "borderColor",
      "overlayColor", "tintColor", "shadowColor",
    ],
    number: [
      "borderRadius", "aspectRatio", "borderTopLeftRadius",
      "borderTopRightRadius", "borderBottomLeftRadius",
      "borderBottomRightRadius", "borderBottomWidth",
      "borderRightWidth", "borderLeftWidth", "borderTopWidth",
      "flex", "flexGrow", "flexShrink", "opacity", "rotation",
      "scaleX", "scaleY", "borderWidth", "shadowOpacity",
      "zIndex", "translateX", "translateY", "shadowRadius",
    ],
    length: [
      "borderStartWidth", "borderEndWidth", "width",
      "height", "margin", "marginBottom", "marginEnd",
      "marginHorizontal", "marginLeft", "marginRight",
      "marginStart", "marginTop", "marginVertical",
      "maxHeight", "maxWidth", "minHeight", "minWidth",
      "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
      "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
      "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
    ],
    nonInterpolable: [
      "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
      "display", "direction", "flexDirection", "flexWrap",
      "justifyContent", "overflow", "position",
      "resizeMode", "end", "start",
    ],
    layout: [
      "shadowOffset"
    ]
  }
})
