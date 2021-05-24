import React from "react"
import { StyleSheet, ViewProps, ViewStyle, StyleProp, TransformsStyle } from "react-native"
import { Interpolation } from "react-spring"
import { animated, SpringValue } from "@react-spring/native"
import { anyOf } from "@monthem/utils"
import {
  FlatTransform,
  flattenTransform,
  InterpolatedTransform,
  normalizeFlattenedTransform,
  flattenViewStyle,
  FlatViewStyle,
  normalizeFlattenedViewStyle,
  InterpolatedViewStyle,
} from "../../../../utils"

export const TransitionalView: React.FC<TransitionalViewProps> = (props) => {
  const { children, progress, styles, range = [0, 1] } = props

  if (styles.length < range.length) {
    throw Error("the length of style array should be bigger than that of range")
  }

  const flattenedStyles = styles
    .map((s) => StyleSheet.flatten(s))
    .map((s) => flattenViewStyle(s))

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
      })
      return [transformKey, interpolation] as const
    })
    .reduce((acc: InterpolatedTransform, ele) => {
      const [key, interpolation] = ele
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {} as InterpolatedTransform)

  const styleKeys = Object.keys(flattenedStyles[0]) as (keyof FlatViewStyle)[]

  const interpolatedStyle = styleKeys
    .map(<K extends keyof FlatViewStyle>(styleKey: K) => {
      if (styleKey === "transform") return [styleKey, interpolatedTransform] as const
      const output = range.map((_, i) => flattenedStyles[i][styleKey]) as FlatViewStyle[K][]
      const interpolation = progress.to({
        //@ts-ignore
        range,
        output,
      })
      return [styleKey, interpolation] as const
    })
    .reduce((acc, [key, interpolation]) => {
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {} as InterpolatedViewStyle)

  const normalizedStyle = normalizeFlattenedViewStyle(interpolatedStyle)

  return (
    //@ts-ignore
    <animated.Text style={normalizedStyle}>
      {children}
    </animated.Text>
  )
}

type TransitionalViewProps = Omit<ViewProps, "style"> & {
  progress: Interpolation<any, number> | SpringValue<number>
  /**
   * describes range of progress value.
   * default range is [0, 1]
   * but it can be customized to whatever range you want
   */
  range?: number[]
  styles: StyleProp<ViewStyle>[]
}
