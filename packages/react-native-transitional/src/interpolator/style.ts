import { ColorValue, Animated } from "react-native"
import chroma from "chroma-js"

import { anyOf } from "@monthem/utils"
import { interpolateNumber } from "./common"

const getRgbaString = (color: ColorValue) => {
    return `rgba(${chroma(color as string).rgba().join(",")})`
}

const mapLengthToString = (length: string | number) => {
    if (typeof length === "string") return length
    return `${length}px`
}

export const interpolateColor = (
    prev: ColorValue = "rgba(255,255,255,0)",
    next: ColorValue = "rgba(255,255,255,0)",
    ratio: number
) => {
    const prevColor = getRgbaString(prev)
    const nextColor = getRgbaString(next)
    return getRgbaString(chroma.scale([prevColor, nextColor])(ratio).hex())
}

export const interpolateLength = (
    prev: string | number = 0,
    next: string | number = 0,
    ratio: number
) => {
    let start = 0, end = 0, unit = "px"
    const length1 = mapLengthToString(prev)
    const length2 = mapLengthToString(next)
    if (length1.match("%") && length2.match("%")) {
        unit = "%"
        start = Number(length1.replace(unit, "")),
            end = Number(length2.replace(unit, ""))
    } else if (length1.match("px") && length2.match("px")) {
        unit = "px"
        start = Number(length1.replace(unit, "")),
            end = Number(length2.replace(unit, ""))
    } else {
        return next
    }

    return `${start + (end - start) * ratio}${unit}`
}

const defaultLayout = { width: 0, height: 0 }
export const interpolateLayout = (prev = defaultLayout, next = defaultLayout, ratio: number) => {
    return {
        width: interpolateNumber(prev.width, next.width, ratio),
        height: interpolateNumber(prev.height, next.height, ratio)
    }
}

export const mapColorToAnimated = (
    prev: ColorValue = "rgba(255,255,255,0)",
    next: ColorValue = "rgba(255,255,255,0)",
    animatedValue: Animated.Value
) => {
    const prevColor = `rgba(${chroma(prev as string).rgba().join(",")})`
    const nextColor = `rgba(${chroma(next as string).rgba().join(",")})`
    return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [prevColor, nextColor]
    })
}

export const mapLengthToAnimated = (
    prev: string | number = 0,
    next: string | number = 0,
    animatedValue: Animated.Value
) => {
    let output1, output2
    const prevLength = mapLengthToString(prev)
    const nextLength = mapLengthToString(next)

    const hasSameUnit = anyOf([
        !!prevLength.match("%") && !!nextLength.match("%"),
        !!prevLength.match("px") && !!nextLength.match("px")
    ])

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

export const mapLayoutToAnimated = (
    prev = defaultLayout,
    next = defaultLayout,
    animated: Animated.Value
) => {
    return {
        width: animated.interpolate({
            inputRange: [0, 1],
            outputRange: [prev.width, next.width]
        }),
        height: animated.interpolate({
            inputRange: [0, 1],
            outputRange: [prev.height, next.height]
        }),
    }
}