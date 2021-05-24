import React from "react"
import { StyleSheet, TextProps, TextStyle, StyleProp, TransformsStyle } from "react-native"
import { Interpolation, InterpolatorConfig, useSpring } from "react-spring"
import { animated, SpringValue } from "@react-spring/native"
import { anyOf } from "@monthem/utils"
import {
  FlatTransform,
  flattenTransform,
  InterpolatedTransform,
  normalizeFlattenedTransform,
} from "../../../../utils"

export const TransitionalText: React.FC<TransitionalTextProps> = (props) => {
  const { children, styles = [], range = [0, 1], extrapolate } = props
  //TODO: should implement auto behavior
  const progress = props.progress || (() => {
    const [spring, api] = useSpring(() => ({
      _progress: 0
    }))
    return spring._progress
  })()

  if (styles.length < range.length) {
    throw Error("the length of style array should be bigger than that of range")
  }

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
        if (!transform) throw new Error(`expected style[${i}].transform to exist but got nothing`)
        return transform[transformKey]
      }) as FlatTransform[K][]
      const interpolation = progress.to({
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

  const styleKeys = Object.keys(flattenedStyles[0]) as (keyof FlatTextStyle)[]

  const interpolatedStyle = styleKeys
    .map(<K extends keyof FlatTextStyle>(styleKey: K) => {
      if (styleKey === "transform") return [styleKey, interpolatedTransform] as const
      const output = range.map((_, i) => flattenedStyles[i][styleKey]) as FlatTextStyle[K][]
      const interpolation = progress.to({
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

  return (
    //@ts-ignore
    <animated.Text style={normalizedStyle}>
      {children}
    </animated.Text>
  )
}

type TransitionalTextProps = Omit<TextProps, "style"> & {
  progress?: Interpolation<any, number> | SpringValue<number>
  /**
   * describes range of progress value.
   * default range is [0, 1]
   * but it can be customized to whatever range you want
   */
  range?: number[]
  styles?: StyleProp<TextStyle>[]
  extrapolate?: InterpolatorConfig["extrapolate"]
}

type FlatTextStyle = Omit<TextStyle, "transform" | "shadowOffset" | "textShadowOffset"> & {
  shadowOffsetX?: number
  shadowOffsetY?: number
  textShadowOffsetX?: number
  textShadowOffsetY?: number
  transform?: Partial<FlatTransform>
}

type InterpolatedTextStyle = {
  [K in keyof FlatTextStyle]: Interpolation<number, NonNullable<FlatTextStyle[K]>>
}

type FlatTextStyleShape = { [K in keyof FlatTextStyle]: any }

const flattenTextStyle = (style: TextStyle): FlatTextStyle => {
  const {
    transform,
    shadowOffset,
    textShadowOffset,
    ...plainStyle
  } = style
  return {
    ...plainStyle,
    transform: flattenTransform(transform),
    shadowOffsetX: shadowOffset?.width,
    shadowOffsetY: shadowOffset?.height,
    textShadowOffsetX: textShadowOffset?.width,
    textShadowOffsetY: textShadowOffset?.height,
  }
}

const normalizeFlattenedTextStyle = <T extends FlatTextStyleShape>(flattened: T) => {
  const { textShadowOffsetY, textShadowOffsetX, shadowOffsetX, shadowOffsetY, transform, ...rest } = flattened
  const normalizedTransform = normalizeFlattenedTransform(transform)
  const textShadowOffset = anyOf([
    textShadowOffsetX,
    textShadowOffsetY,
  ]) ? {
    width: textShadowOffsetX,
    height: textShadowOffsetY
  } : undefined
  const shadowOffset = anyOf([
    shadowOffsetX,
    shadowOffsetY,
  ]) ? {
    width: shadowOffsetX,
    height: shadowOffsetY
  } : undefined
  return {
    textShadowOffset,
    shadowOffset,
    transform: normalizedTransform,
    ...rest
  }
}
