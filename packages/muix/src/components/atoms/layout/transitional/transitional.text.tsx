import React from "react"
import { StyleSheet, TextProps, TextStyle, StyleProp, TransformsStyle } from "react-native"
import { Interpolation, InterpolatorConfig, SpringConfig, useSpring, animated, SpringValue } from "@react-spring/native"
import {
  FlatTransform,
  InterpolatedTransform,
  FlatTextStyle,
  flattenTextStyle,
  InterpolatedTextStyle,
  normalizeFlattenedTextStyle,
  defaultFlatTransform,
} from "@monthem/muix"
import { getRange, wholeStyleProperties } from "@monthem/utils"
import chroma from "chroma-js"

export const TransitionalText: React.FC<TransitionalTextProps> = (props) => {
  const {
    children,
    styles = [],
    extrapolate,
    styleIndex,
    onStyleChange,
    springConfig,
    fallbackStyle = {},
    ..._props
  } = props

  const flattenedFallback = flattenTextStyle(StyleSheet.flatten(fallbackStyle))
  const styleConcat = flattenTextStyle(StyleSheet.flatten([
    StyleSheet.flatten(fallbackStyle),
    StyleSheet.flatten(styles)
  ]))

  const range = props.progress
    ? props.range || getRange(0, styles.length - 1)
    : getRange(0, styles.length - 1)

  if (styles.length < range.length) {
    throw Error("the length of style array should be bigger than that of range")
  }

  const [spring, springApi] = (() => {
    if (props.progress) return [{ progress: props.progress }, null] as const
    const [_spring, _api] = useSpring(() => ({ progress: 0 }))
    return [_spring, _api] as const
  })()


  const flattenedStyles = styles
    .map((s) => StyleSheet.flatten(s))
    .map((s) => flattenTextStyle(s))

  const flattendTransforms = flattenedStyles.map((s) => s.transform)
  const transformKeys = flattendTransforms[0]
    ? Object.keys(flattendTransforms[0]) as (keyof FlatTransform)[]
    : []

  const interpolatedTransform = transformKeys
    .map(<K extends keyof FlatTransform>(transformKey: K) => {
      const output = range.map((_, i) => {
        const transform = flattendTransforms[i]
        if (transform === undefined) return flattenedFallback.transform
          ? flattenedFallback.transform[transformKey]
          : defaultFlatTransform[transformKey]
        return transform[transformKey]
      }) as FlatTransform[K][]
      const interpolation = spring.progress.to({
        //@ts-ignore
        range,
        output,
        extrapolate,
      })
      return [transformKey, interpolation] as const
    })
    .reduce((acc: InterpolatedTransform, ele) => {
      const [key, interpolation] = ele
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {} as InterpolatedTransform)

  const styleKeys = Object.keys(styleConcat) as (keyof FlatTextStyle)[]

  const interpolatedStyle = styleKeys
    .map(<K extends keyof FlatTextStyle>(styleKey: K) => {
      if (styleKey === "transform") return [styleKey, interpolatedTransform] as const
      let output = range.map((_, i) => {
        const value = flattenedStyles[i][styleKey]
        if (value !== undefined) return value
        return flattenedFallback[styleKey]
      }) as FlatTextStyle[K][]
      if (styleKey.match(/color/i)) {
        //@ts-ignore
        output = output.map((color) => `rgba(${chroma(color as string).rgba().join(",")})`)
      }

      const isNonInterpolableKey = wholeStyleProperties
        .nonInterpolable
        .filter((key) => key === styleKey)
        .length !== 0

      const interpolation = isNonInterpolableKey
        ? spring.progress.to((value) => {
          const index = Math.max(Math.min(Math.round(value), flattenedStyles.length - 1), 0)
          const output = flattenedStyles[index][styleKey] || flattenedFallback[styleKey]
          return output
        })
        : spring.progress.to({
          //@ts-ignore
          range,
          output,
          extrapolate,
        })

      return [styleKey, interpolation] as const
    })
    .reduce((acc, [key, interpolation]) => {
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {} as InterpolatedTextStyle)

  const normalizedStyle = normalizeFlattenedTextStyle(interpolatedStyle)

  React.useEffect(() => {
    if (props.progress) return;
    if (props.styleIndex === undefined) return;
    if (!props.styles) return;
    springApi?.start({
      progress: styleIndex,
      onResolve: onStyleChange,
      config: springConfig,
    })
  }, [styleIndex, styles, onStyleChange, props.progress])

  return (
    //@ts-ignore
    <animated.Text {..._props} style={normalizedStyle}>
      {children}
    </animated.Text>
  )
}

export type TransitionalTextProps = Omit<TextProps, "style"> & {
  progress?: Interpolation<any, number> | SpringValue<number>
  /**
   * describes range of progress value.
   * default range is [0, ..., styles.length - 1]
   * but it can be customized to whatever range you want
   */
  range?: number[]
  styles?: StyleProp<TextStyle>[]
  fallbackStyle?: StyleProp<TextStyle>
  extrapolate?: InterpolatorConfig["extrapolate"]
  /** works only when progress is undefined */
  styleIndex?: number
  /** works only when progress is undefined */
  onStyleChange?: () => void
  /** works only when progress is undefined */
  springConfig?: SpringConfig
}
