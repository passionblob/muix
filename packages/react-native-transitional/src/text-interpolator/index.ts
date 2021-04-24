/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Animated, TextStyle } from "react-native"
import { keysOf } from "../../../muix-components/src/utils"
import { styleInterpolator, animatedStyleMappeer } from "./style"

const getDefaultValue = (key: keyof TextStyle) => {
    if (key === "opacity") return 1
    return undefined
}

export const getInterpolatedStyle = (
    prevStyle: TextStyle,
    nextStyle: TextStyle,
    ratio: number
): TextStyle => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof TextStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(assertedKey)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(assertedKey)
        //@ts-ignore
        acc[assertedKey] = styleInterpolator[assertedKey](prevValue, nextValue, ratio)
        return acc
    }, {} as TextStyle)
}

export const getTransitionalStyle = (
    prevStyle: TextStyle,
    nextStyle: TextStyle,
    anim: Animated.Value,
): Animated.AnimatedProps<TextStyle> => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof TextStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(key)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(key)
        //@ts-ignore
        acc[assertedKey] = animatedStyleMappeer[assertedKey](prevValue, nextValue, anim)
        return acc
    }, {} as Animated.AnimatedProps<TextStyle>)
}