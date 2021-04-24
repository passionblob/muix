/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Animated, ViewStyle } from "react-native"
import { keysOf } from "../../../muix-components/src/utils"
import { mapNumberToAnimated, interpolateNumber, makeRecords, returnNext } from "./common"

const flattenTransform = (arr: NonNullable<ViewStyle["transform"]>): Partial<FlatTransform> => {
    return arr.reduce((acc, obj) => {
        Object.assign(acc, obj)
        return acc
    }, {} as Partial<FlatTransform>)
}

const spreadFlattened = (flat: FlatTransform | Animated.WithAnimatedValue<FlatTransform>) => {
    return Object.keys(flat).reduce((acc, key) => {
        const asserted = key as TransformKeys
        const mapped = { [asserted]: flat[asserted] }
        return acc.concat(mapped as ViewStyle["transform"][keyof ViewStyle["transform"]])
    }, [] as NonNullable<ViewStyle["transform"]>)
}

const interpolateRotation = (prev = "0deg", next = "0deg", ratio: number) => {
    const unit = "deg"
    const prevNum = Number(prev.replace(/deg|rad/, ""))
    const nextNum = Number(next.replace(/deg|rad/, ""))
    const prevDegree = prev.match(/deg/) ? prevNum : prevNum * 180 / Math.PI
    const nextDegree = next.match(/deg/) ? nextNum : nextNum * 180 / Math.PI
    return interpolateNumber(prevDegree, nextDegree, ratio) + unit
}

const transformKeys = [
    "matrix",
    "perspective",
    "rotate", "rotateX", "rotateY", "rotateZ",
    "scale", "scaleX", "scaleY",
    "translateX", "translateY",
    "skewX", "skewY"
] as const

const defaultTransform: ViewStyle["transform"] = [
    { matrix: [1, 0, 0, 1, 0, 0] },
    { perspective: 0 },
    { rotate: "0deg" }, { rotateX: "0deg" }, { rotateY: "0deg" }, { rotateZ: "0deg" },
    { scale: 1 }, { scaleX: 1 }, { scaleY: 1 },
    { translateX: 0 }, { translateY: 0 },
    { skewX: "0deg" }, { skewY: "0deg" },
]

const defaultFlatTransform = flattenTransform(defaultTransform)

const defaultMatrix = [0, 0, 0, 0, 0, 0]

export const interpolateMatrix = (prev = defaultMatrix, next = defaultMatrix, ratio: number): number[] => {
    return defaultMatrix.map((_, i) => interpolateNumber(prev[i], next[i], ratio))
}

const mapRotationToAnimated = (prev = "0deg", next = "0deg", animated: Animated.Value) => {
    const unit = "deg"
    const prevNum = Number(prev.replace(/deg|rad/, ""))
    const nextNum = Number(next.replace(/deg|rad/, ""))
    const prevDegree = prev.match(/deg/) ? prevNum : prevNum * 180 / Math.PI
    const nextDegree = next.match(/deg/) ? nextNum : nextNum * 180 / Math.PI
    return animated.interpolate({
        inputRange: [0, 1],
        outputRange: [`${prevDegree}${unit}`, `${nextDegree}${unit}`]
    })
}

export const mapMatrixToAnimated = (
    prev = defaultMatrix,
    next = defaultMatrix,
    animated: Animated.Value
): Animated.WithAnimatedArray<number> => {
    return defaultMatrix.map((_, i) => {
        return animated.interpolate({
            inputRange: [0, 1],
            outputRange: [prev[i], next[i]]
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
    ...makeRecords(degreeProperties, interpolateRotation),
    ...makeRecords(numberProperties, interpolateNumber),
    matrix: returnNext,
    // matrix: interpolateMatrix,
} as {
        [key in TransformKeys]: (
            prev?: FlatTransform[key],
            next?: FlatTransform[key],
            ratio?: number
        ) => FlatTransform[key]
    }

const animatedTransformMappeer = {
    ...makeRecords(degreeProperties, mapRotationToAnimated),
    ...makeRecords(numberProperties, mapNumberToAnimated),
    matrix: returnNext,
    // matrix: mapMatrixToAnimated,
} as {
        [key in TransformKeys]: (
            prev: FlatTransform[key],
            next: FlatTransform[key],
            animatedValue: Animated.Value
        ) => Animated.WithAnimatedValue<FlatTransform[key]> | FlatTransform[key]
    }

export const interpolateTransform = (
    prev = defaultTransform,
    next = defaultTransform,
    ratio: number
): ViewStyle["transform"] => {
    const flatPrev = { ...defaultFlatTransform, ...flattenTransform(prev) }
    const flatNext = { ...defaultFlatTransform, ...flattenTransform(next) }
    const interpolated = keysOf(flatPrev, flatNext).reduce((acc, key) => {
        const assertedKey = key as TransformKeys
        const prevValue = flatPrev[assertedKey]
        const nextValue = flatNext[assertedKey]
        //@ts-ignore
        acc[assertedKey] = transformInterpolator[assertedKey](prevValue, nextValue, ratio)
        return acc
    }, {} as FlatTransform)

    return spreadFlattened(interpolated)
}

export const mapTransformToAnimated = (
    prev = defaultTransform,
    next = defaultTransform,
    animated: Animated.Value
): Animated.WithAnimatedValue<NonNullable<ViewStyle["transform"]>> => {
    const flatPrev = { ...defaultFlatTransform, ...flattenTransform(prev) }
    const flatNext = { ...defaultFlatTransform, ...flattenTransform(next) }
    const mapped = keysOf(flatPrev, flatNext).reduce((acc, key) => {
        const prevValue = flatPrev[key]
        const nextValue = flatNext[key]
        //@ts-ignore
        acc[key] = animatedTransformMappeer[key](prevValue, nextValue, animated)
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
