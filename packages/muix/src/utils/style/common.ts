import { anyOf, makeRecords, viewStyleProperties } from "@monthem/utils"
import { TextStyle, TransformsStyle, ViewStyle } from "react-native"
import { Interpolation } from "react-spring"

export type FlatTransform = {
  perspective: number
  rotate: string
  rotateX: string
  rotateY: string
  rotateZ: string
  skewX: string
  skewY: string
  translateX: number
  translateY: number
  scale: number
  scaleX: number
  scaleY: number
}

export const defaultFlatTransform: FlatTransform = {
  perspective: 1000,
  ...makeRecords(["rotate", "rotateX", "rotateY", "rotateZ", "skewX", "skewY"] as const, "0deg"),
  ...makeRecords(["translateX", "translateY"] as const, 0),
  ...makeRecords(["scale", "scaleX", "scaleY"] as const, 0)
}

export const flattenTransform = (transform: TransformsStyle["transform"]): undefined | Partial<FlatTransform> => {
  const result: Partial<FlatTransform> = {}
  if (transform === undefined) return undefined

  transform.forEach((t) => {
    const [key, value] = Object.entries(t)[0]
    result[key as keyof FlatTransform] = value
  })

  return result
}

export type FlatTransformShape = { [K in keyof FlatTransform]: any }
export type NormalizedTransform<T extends Partial<FlatTransformShape>> = {
  [K in keyof T]: { [_K in K]: T[K] }
}[keyof T][]

export type InterpolatedTransform = {
  [K in keyof FlatTransform]: Interpolation<number, NonNullable<FlatTransform[K]>>
}

export const normalizeFlattenedTransform = <T extends Partial<FlatTransformShape>>(flattend: T): NormalizedTransform<T> => {
  return Object.entries(flattend)
    .map(([key, value]) => {
      return { [key]: value } as NormalizedTransform<T>[number]
    })
}

export type FlatViewStyle = Omit<ViewStyle, "transform" | "shadowOffset" | "textShadowOffset"> & {
  shadowOffsetX?: number
  shadowOffsetY?: number
  transform?: Partial<FlatTransform>
}

export type InterpolatedViewStyle = {
  [K in keyof FlatViewStyle]: Interpolation<number, NonNullable<FlatViewStyle[K]>>
}

export type FlatTextStyle = Omit<TextStyle, "transform" | "shadowOffset" | "textShadowOffset"> & {
  shadowOffsetX?: number
  shadowOffsetY?: number
  textShadowOffsetX?: number
  textShadowOffsetY?: number
  transform?: Partial<FlatTransform>
}

export type InterpolatedTextStyle = {
  [K in keyof FlatTextStyle]: Interpolation<number, NonNullable<FlatTextStyle[K]>>
}

export type FlatTextStyleShape = { [K in keyof FlatTextStyle]: any }

export const flattenTextStyle = (style: TextStyle): FlatTextStyle => {
  const {
    transform,
    shadowOffset,
    textShadowOffset,
    ...plainStyle
  } = style
  return {
    ...plainStyle,
    transform: flattenTransform(transform),
    ...(shadowOffset ? {
      shadowOffsetX: shadowOffset?.width,
      shadowOffsetY: shadowOffset?.height,
    } : {}),
    ...(textShadowOffset ? {
      textShadowOffsetX: textShadowOffset?.width,
      textShadowOffsetY: textShadowOffset?.height,
    } : {})
  }
}

export const normalizeFlattenedTextStyle = <T extends FlatTextStyleShape>(flattened: T) => {
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
