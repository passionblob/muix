import { Animated } from "react-native"

export const interpolateNumber = (prev = 0, next = 0, ratio: number): number => {
    return prev + (next - prev) * ratio
}

export const mapNumberToAnimated = (
    prev = 0,
    next = 0,
    animated: Animated.Value
): Animated.AnimatedInterpolation => {
    return animated.interpolate({
        inputRange: [0, 1],
        outputRange: [prev, next]
    })
}

export const returnNext = <Prev, Next>(prev: Prev, next: Next): Next => next
