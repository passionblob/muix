import { ColorValue, Animated } from "react-native"
import { anyOf } from "../../../../utils"
import { TransitionalSupportedStyle } from "./types"
import chroma from "chroma-js"

const getRgbaString = (color: ColorValue) => {
    return `rgba(${chroma(color as string).rgba().join(",")})`
}

const mapLengthToString = (length: string | number) => {
    if (typeof length === "string") return length
    return `${length}px`
}

const interpolateColor = (
    value1: ColorValue="rgba(255,255,255,0)",
    value2: ColorValue="rgba(255,255,255,0)",
    ratio: number
) => {
    const prevColor = getRgbaString(value1)
    const nextColor = getRgbaString(value2)
    return getRgbaString(chroma.scale([prevColor, nextColor])(ratio).hex())
}

const interpolateLength = (
    value1: string | number = 0,
    value2: string | number = 0,
    ratio: number
) => {
    let start = 0, end = 0, unit = "px"
    const length1 = mapLengthToString(value1)
    const length2 = mapLengthToString(value2)
    if (length1.match("%") && length2.match("%")) {
        unit = "%"
        start = Number(length1.replace(unit, "")),
        end = Number(length2.replace(unit, ""))
    } else if (length1.match("px") && length2.match("px")) {
        unit = "px"
        start = Number(length1.replace(unit, "")),
        end = Number(length2.replace(unit, ""))
    } else {
        return value2
    }

    return `${start + (end - start) * ratio}${unit}`
}

const interpolateNumber = (value1: number = 0, value2: number = 0, ratio: number) => {
    return value1 + (value2 - value1) * ratio
}

const returnNextValue = <Prev, Next>(prev: Prev, next: Next, ratio: number): Next => next

const mapColorToAnimated = (
    prevValue: ColorValue = "rgba(255,255,255,0)",
    nextValue: ColorValue = "rgba(255,255,255,0)",
    animatedValue: Animated.Value
) => {
    const prevColor = `rgba(${chroma(prevValue as string).rgba().join(",")})`
    const nextColor = `rgba(${chroma(nextValue as string).rgba().join(",")})`
    return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [prevColor, nextColor]
    })
}

const mapLengthToAnimated = (
    prevValue: string | number = 0,
    nextValue: string | number = 0,
    animatedValue: Animated.Value
) => {
    let output1, output2
    const prevLength = mapLengthToString(prevValue)
    const nextLength = mapLengthToString(nextValue)

    const hasSameUnit = anyOf(
        !!prevLength.match("%") && !!nextLength.match("%"),
        !!prevLength.match("px") && !!nextLength.match("px")
    )

    if (hasSameUnit) {
        output1 = prevLength, output2 = nextLength
    } else {
        output1 = nextLength, output2 = nextLength
    }

    return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [output1, output2]
    })
}

const mapNumberToAnimated = (
    prev: number = 0,
    next: number = 0,
    animated: Animated.Value
) => {
    return animated.interpolate({
        inputRange: [0, 1],
        outputRange: [prev, next]
    })
}

const makeRecords = <Keys extends Readonly<string[]>, T>(keys: Keys, value: T) => {
    return keys.reduce((acc, key) => {
        acc[key as Keys[number]] = value
        return acc
    }, {} as Record<Keys[number], T>)
}

const colorProperties = [
    "backgroundColor", "borderColor", "borderEndColor",
    "borderLeftColor", "borderRightColor", "borderStartColor",
    "borderTopColor", "color", "overlayColor", "textDecorationColor",
    "textShadowColor", "tintColor", "borderBottomColor", "shadowColor",
] as const

const numberProperties = [
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
] as const

const lengthProperties = [
    "borderStartWidth", "borderEndWidth", "width",
    "height", "margin", "marginBottom", "marginEnd",
    "marginHorizontal", "marginLeft", "marginRight",
    "marginStart", "marginTop", "marginVertical",
    "maxHeight", "maxWidth", "minHeight", "minWidth",
    "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
    "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
    "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
] as const

const nonInterpolatableProperties = [
    "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
    "display", "direction", "flexDirection", "flexWrap", "fontFamily",
    "fontStyle", "includeFontPadding", "justifyContent", "overflow",
    "position", "resizeMode", "textAlign", "textAlignVertical",
    "textDecorationLine", "textDecorationStyle", "writingDirection"
] as const

export const styleInterpolator: {
    [key in NonNullable<keyof Animated.AnimatedProps<TransitionalSupportedStyle>>]: (
        value1: TransitionalSupportedStyle[key],
        value2: TransitionalSupportedStyle[key],
        ratio: number
    ) => TransitionalSupportedStyle[key]
} = {
    ...makeRecords(colorProperties, interpolateColor),
    ...makeRecords(numberProperties, interpolateNumber),
    ...makeRecords(lengthProperties, interpolateLength),
    ...makeRecords(nonInterpolatableProperties, returnNextValue),
    // borderStyle,
    // end,
    // fontVariant,
    // fontWeight,
    // shadowOffset,
    // start,
    // testID,
    // textShadowOffset,
    // textTransform,
    // transform,
    // transformMatrix,
}

export const animatedStyleMappeer: {
    [key in NonNullable<keyof Animated.AnimatedProps<TransitionalSupportedStyle>>]: (
        prevValue: TransitionalSupportedStyle[key],
        nextValue: TransitionalSupportedStyle[key],
        animatedValue: Animated.Value
    ) => Animated.WithAnimatedValue<TransitionalSupportedStyle[key]> | TransitionalSupportedStyle[key]
} = {
    ...makeRecords(colorProperties, mapColorToAnimated),
    ...makeRecords(numberProperties, mapNumberToAnimated),
    ...makeRecords(lengthProperties, mapLengthToAnimated),
    ...makeRecords(nonInterpolatableProperties, returnNextValue)
    // borderStyle,
    // end,
    // fontVariant,
    // fontWeight,
    // shadowOffset,
    // start,
    // testID,
    // textShadowOffset,
    // textTransform,
    // transform,
    // transformMatrix,
}