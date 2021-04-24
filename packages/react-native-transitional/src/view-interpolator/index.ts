/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Animated, ViewStyle } from "react-native"
import { keysOf } from "../../../muix-components/src/utils"
import { styleInterpolator, animatedStyleMappeer } from "./style"

const getDefaultValue = (key: keyof ViewStyle) => {
    if (key === "opacity") return 1
    return undefined
}

export const getInterpolatedStyle = (
    prevStyle: ViewStyle,
    nextStyle: ViewStyle,
    ratio: number
): ViewStyle => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof ViewStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(assertedKey)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(assertedKey)
        //@ts-ignore
        acc[assertedKey] = styleInterpolator[assertedKey](prevValue, nextValue, ratio)
        return acc
    }, {} as ViewStyle)
}

export const getTransitionalStyle = (
    prevStyle: ViewStyle,
    nextStyle: ViewStyle,
    anim: Animated.Value,
): Animated.AnimatedProps<ViewStyle> => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof ViewStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(key)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(key)
        //@ts-ignore
        acc[assertedKey] = animatedStyleMappeer[assertedKey](prevValue, nextValue, anim)
        return acc
    }, {} as Animated.AnimatedProps<ViewStyle>)
}