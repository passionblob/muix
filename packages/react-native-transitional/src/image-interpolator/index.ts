/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Animated, ImageStyle } from "react-native"
import { keysOf } from "../../../muix-components/src/utils"
import { styleInterpolator, animatedStyleMappeer } from "./style"

const getDefaultValue = (key: keyof ImageStyle) => {
    if (key === "opacity") return 1
    return undefined
}

export const getInterpolatedStyle = (
    prevStyle: ImageStyle,
    nextStyle: ImageStyle,
    ratio: number
): ImageStyle => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof ImageStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(assertedKey)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(assertedKey)
        //@ts-ignore
        acc[assertedKey] = styleInterpolator[assertedKey](prevValue, nextValue, ratio)
        return acc
    }, {} as ImageStyle)
}

export const getTransitionalStyle = (
    prevStyle: ImageStyle,
    nextStyle: ImageStyle,
    anim: Animated.Value,
): Animated.AnimatedProps<ImageStyle> => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof ImageStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(key)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(key)
        //@ts-ignore
        acc[assertedKey] = animatedStyleMappeer[assertedKey](prevValue, nextValue, anim)
        return acc
    }, {} as Animated.AnimatedProps<ImageStyle>)
}