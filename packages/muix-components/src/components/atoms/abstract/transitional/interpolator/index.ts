/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Animated } from "react-native"
import { keysOf } from "../../../../../utils/object/keysOf"
import { TransitionalSupportedStyle } from "../types"
import { styleInterpolator, animatedStyleMappeer } from "./style"

const getDefaultValue = (key: keyof TransitionalSupportedStyle) => {
    if (key === "opacity") return 1
    if (key === "fontSize") return 16
    return undefined
}

export const getInterpolatedStyle = (
    prevStyle: TransitionalSupportedStyle,
    nextStyle: TransitionalSupportedStyle,
    ratio: number
): TransitionalSupportedStyle => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof TransitionalSupportedStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(assertedKey)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(assertedKey)
        //@ts-ignore
        acc[assertedKey] = styleInterpolator[assertedKey](prevValue, nextValue, ratio)
        return acc
    }, {} as TransitionalSupportedStyle)
}

export const getTransitionalStyle = (
    prevStyle: TransitionalSupportedStyle,
    nextStyle: TransitionalSupportedStyle,
    anim: Animated.Value,
): Animated.AnimatedProps<TransitionalSupportedStyle> => {
    return keysOf(prevStyle, nextStyle).reduce((acc, key) => {
        const assertedKey = key as keyof TransitionalSupportedStyle
        const prevValue = prevStyle[assertedKey] || getDefaultValue(key)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(key)
        if (assertedKey === "transform") console.log(prevValue, nextValue)
        //@ts-ignore
        acc[assertedKey] = animatedStyleMappeer[assertedKey](prevValue, nextValue, anim)
        return acc
    }, {} as Animated.AnimatedProps<TransitionalSupportedStyle>)
}