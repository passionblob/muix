import { Animated } from "react-native"

export const interpolateNumber = (prev = 0, next = 0, ratio: number): number => {
    return prev + (next - prev) * ratio
}

export const mapNumberToAnimated = (
    prev=0,
    next=0,
    animated: Animated.Value
): Animated.AnimatedInterpolation => {
    return animated.interpolate({
        inputRange: [0, 1],
        outputRange: [prev, next]
    })
}

export const makeRecords = <Keys extends Readonly<string[]>, T>(
    keys: Keys, value: T
): Record<Keys[number], T> => {
    return keys.reduce((acc, key) => {
        acc[key as Keys[number]] = value
        return acc
    }, {} as Record<Keys[number], T>)
}

export const returnNext = <Prev, Next>(prev: Prev, next: Next): Next => next
