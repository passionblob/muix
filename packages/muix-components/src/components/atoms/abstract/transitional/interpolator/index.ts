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
        const prevValue = prevStyle[assertedKey] || getDefaultValue(key)
        const nextValue = nextStyle[assertedKey] || getDefaultValue(key)
        const value = styleInterpolator[assertedKey](prevValue, nextValue, ratio)
        acc[assertedKey] = value
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
        acc[assertedKey] = animatedStyleMappeer[assertedKey](prevValue, nextValue, anim)
        return acc
    }, {} as Animated.AnimatedProps<TransitionalSupportedStyle>)
}