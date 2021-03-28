import { Animated, ViewStyle } from "react-native"
import { keysOf } from "../../../../../utils/object/keysOf"
import {mapNumberToAnimated, interpolateNumber, makeRecords} from "./common"

const transformKeys = [
    "matrix", "perspective", "rotate",
    "rotateX", "rotateY", "rotateZ",
    "scale", "scaleX", "scaleY",
    "translateX", "translateY", "skewX", "skewY"
] as const

const defaultTransform: ViewStyle["transform"] = [
    {matrix: [0, 0, 0, 0, 0, 0,]}, {perspective: 0},
    {rotate: "0deg"}, {rotateX: "0deg"}, {rotateY: "0deg"}, {rotateZ: "0deg"},
    {translateX: 0}, {translateY: 0}, {skewX: "0deg"}, {skewY: "0deg"},
    {scale: 0}, {scaleX: 0}, {scaleY: 0},
]

const flattenTransform = (arr: NonNullable<ViewStyle["transform"]>): Partial<FlatTransform> => {
    return arr.reduce((acc, obj) => {
        Object.assign(acc, obj)
        return acc
    }, {} as Partial<FlatTransform>)
}

const spreadFlattened = (flat: FlatTransform | Animated.WithAnimatedValue<FlatTransform>) => {
    return Object.keys(flat).reduce((acc, key) => {
        const asserted = key as TransformKeys
        const mapped = {[asserted]: flat[asserted]}
        return acc.concat(mapped as ViewStyle["transform"][keyof ViewStyle["transform"]])
    }, [] as NonNullable<ViewStyle["transform"]>)
}

const interpolateDegree = (prev="0deg", next="0deg", ratio: number) => {
    const prevNum = Number(prev.replace("deg", ""))
    const nextNum = Number(next.replace("deg", ""))
    return interpolateNumber(prevNum, nextNum, ratio) + "deg"
}

const defaultMatrix = [0,0,0,0,0,0]
export const interpolateMatrix = (prev=defaultMatrix, next=defaultMatrix, ratio: number): number[] => {
    return defaultMatrix.map((_, i) => interpolateNumber(prev[i], next[i], ratio))
}

const mapDegreeToAnimated = (prev="0deg", next="0deg", animated: Animated.Value) => {
    return animated.interpolate({
        inputRange: [0, 1],
        outputRange: [prev, next]
    })
}

export const mapMatrixToAnimated = (
    prev=defaultMatrix,
    next=defaultMatrix,
    animated: Animated.Value
): Animated.WithAnimatedValue<FlatTransform["matrix"]> => {
    return defaultMatrix.map((_, i) => {
        return animated.interpolate({
            inputRange: [0, 1],
            outputRange: [prev[i] || 0, next[i] || 0]
        })
    })
}

const degreeProperties = [
    "rotate", "rotateX", "rotateY", "rotateZ", "skewX", "skewY"
] as const

const numberProperties = [
    "perspective", "scale", "scaleX", "scaleY", "translateX", "translateY"
] as const

const transformInterpolator = {
    ...makeRecords(degreeProperties, interpolateDegree),
    ...makeRecords(numberProperties, interpolateNumber),
    matrix: interpolateMatrix,
} as {
    [key in TransformKeys]: (
        prev?: FlatTransform[key],
        next?: FlatTransform[key],
        ratio?: number
    ) => FlatTransform[key]
}

const animatedTransformMappeer = {
    ...makeRecords(degreeProperties, mapDegreeToAnimated),
    ...makeRecords(numberProperties, mapNumberToAnimated),
    matrix: mapMatrixToAnimated,
} as {
    [key in TransformKeys]: (
        prev: FlatTransform[key],
        next: FlatTransform[key],
        animatedValue: Animated.Value
    ) => Animated.WithAnimatedValue<FlatTransform[key]> | FlatTransform[key]
}

export const interpolateTransform = (
    prev=defaultTransform,
    next=defaultTransform,
    ratio: number
): ViewStyle["transform"] => {
    const flatPrev = flattenTransform(prev)
    const flatNext = flattenTransform(next)
    const interpolated = keysOf(flatPrev, flatNext).reduce((acc, key) => {
        const assertedKey = key as TransformKeys
        const prevValue = flatPrev[assertedKey]
        const nextValue = flatNext[assertedKey]
        const value = transformInterpolator[assertedKey](prevValue, nextValue, ratio)
        acc[assertedKey] = value
        return acc
    }, {} as FlatTransform)

    return spreadFlattened(interpolated)
}

export const mapTransformToAnimated = (
    prev=defaultTransform,
    next=defaultTransform,
    animated: Animated.Value
): Animated.WithAnimatedValue<NonNullable<ViewStyle["transform"]>> => {
    const flatPrev = flattenTransform(prev)
    const flatNext = flattenTransform(next)
    const mapped = transformKeys.reduce((acc, key) => {
        const prevValue = flatPrev[key]
        const nextValue = flatNext[key]

        if (key === "matrix") {
            if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
                const value = animatedTransformMappeer[key](prevValue, nextValue, animated)
                acc[key] = value
            } else if (Array.isArray(nextValue)) {
                acc[key] = nextValue
            }
        } else if (numberProperties.includes(key as NumberKeys)) {
            const asserted = key as NumberKeys
            if (typeof prevValue === "number" && typeof nextValue === "number") {
                const value = animatedTransformMappeer[asserted](prevValue, nextValue, animated)
                acc[asserted] = value            
            } else if (typeof nextValue === "number") {
                acc[asserted] = nextValue
            }
        } else if (degreeProperties.includes(key as StringKeys)) {
            const asserted = key as StringKeys
            if (typeof prevValue === "string" && typeof nextValue === "string") {
                const value = animatedTransformMappeer[asserted](prevValue, nextValue, animated)
                acc[asserted] = value
            } else if (typeof nextValue === "string") {
                acc[asserted] = nextValue
            }
        }

        return acc
    }, {} as Animated.WithAnimatedValue<FlatTransform>)
    return spreadFlattened(mapped)
}

type FlatTransform = {
    matrix: number[]
} & {
    [K in NumberKeys]: number
} & {
    [K in StringKeys]: string
}

type NumberKeys = typeof numberProperties[number]

type StringKeys = typeof degreeProperties[number]

type TransformKeys = typeof transformKeys[number]
