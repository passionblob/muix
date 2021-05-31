import React from "react"
import { StyleSheet, ViewProps, ViewStyle, StyleProp, Animated } from "react-native"
import { getRange, viewStyleProperties, wholeStyleProperties } from "@monthem/utils"
import {
  FlatTransform,
  InterpolatedTransform,
  flattenViewStyle,
  FlatViewStyle,
  normalizeFlattenedViewStyle,
  defaultFlatTransform,
} from "@monthem/muix"
import chroma from "chroma-js"

export const _TransitionalAnimatedView: React.FC<TransitionalViewProps> = (props) => {
  const {
    extrapolate = "clamp",
    progress,
    fallbackStyle = {},
    styles = [],
    children,
    ..._props
  } = props


  const flattenedFallback = flattenViewStyle(StyleSheet.flatten(fallbackStyle))
  const styleConcat = flattenViewStyle(StyleSheet.flatten([
    StyleSheet.flatten(fallbackStyle),
    StyleSheet.flatten(styles)
  ]))

  const range = props.progress
    ? props.range || getRange(0, styles.length - 1)
    : getRange(0, styles.length - 1)

  if (styles.length < range.length) {
    throw Error("the length of style array should be bigger than that of range")
  }

  const flattenedStyles = styles
    .map((s) => StyleSheet.flatten(s))
    .map((s) => flattenViewStyle(s))

  const flattendTransforms = flattenedStyles.map((s) => s.transform)
  const transformKeys = (flattendTransforms.filter((t) => t !== undefined) as Partial<FlatTransform>[])
    .map((t) => Object.keys(t))
    .reduce((acc, ele) => acc.concat(ele), []) as (keyof FlatTransform)[]

  const interpolatedTransform = transformKeys
    .map(<K extends keyof FlatTransform>(transformKey: K) => {
      const output = range.map((_, i) => {
        const transform = flattendTransforms[i]
        if (!transform || transform[transformKey] === undefined) return flattenedFallback.transform
          ? flattenedFallback.transform[transformKey]
          : defaultFlatTransform[transformKey]
        return transform[transformKey]
      }) as string[] | number[]
      const interpolation = progress.interpolate({
        inputRange: range,
        outputRange: output,
        extrapolate
      })
      return [transformKey, interpolation] as const
    })
    .reduce((acc: InterpolatedTransform, ele) => {
      const [key, interpolation] = ele
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {} as InterpolatedTransform)

  const styleKeys = Object.keys(styleConcat) as (keyof FlatViewStyle)[]

  const interpolatedStyle = styleKeys
    .map(<K extends keyof FlatViewStyle>(styleKey: K) => {
      if (styleKey === "transform") return [styleKey, interpolatedTransform] as const
      const fallback = flattenedFallback[styleKey]
      let output = range.map((_, i) => {
        const value = flattenedStyles[i][styleKey]
        if (value !== undefined) return value
        if (fallback === undefined) throw Error(`${styleKey} has no fallback style`)
        return fallback
      }) as string[] | number[]
      if (styleKey.match(/color/i)) {
        //@ts-ignore
        output = output.map((color) => `rgba(${chroma(color as string).rgba().join(",")})`)
      }

      const isNonInterpolableKey = wholeStyleProperties
        .nonInterpolable
        .filter((key) => key === styleKey)
        .length > 0

      const roundedProgress = progress.interpolate({
        inputRange: range,
        outputRange: range,
        easing: (value) => {
          const index = Math.max(Math.min(Math.round(value), flattenedStyles.length - 1), 0)
          return index
        }
      })
      
      const interpolation = isNonInterpolableKey
        ? roundedProgress.interpolate({
          inputRange: range,
          outputRange: output,
          extrapolate,
        })
        : progress.interpolate({
          inputRange: range,
          outputRange: output,
          extrapolate,
        })

      return [styleKey, interpolation] as const
    })
    .reduce((acc, [key, interpolation]) => {
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {})

  const normalizedStyle = normalizeFlattenedViewStyle(interpolatedStyle)

  return (
    //@ts-ignore
    <Animated.View style={normalizedStyle} {..._props}>
      {children}
    </Animated.View>
  )
}

export type TransitionalViewProps = Omit<ViewProps, "style"> & {
  progress: Animated.Value | Animated.AnimatedInterpolation
  /**
   * describes range of progress value.
   * default range is [0, ..., styles.length - 1]
   * but it can be customized to whatever range you want
   */
  range?: number[]
  styles?: StyleProp<ViewStyle>[]
  fallbackStyle?: StyleProp<ViewStyle>
  extrapolate?: Animated.ExtrapolateType
}

