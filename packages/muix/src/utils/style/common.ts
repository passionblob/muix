import { anyOf } from "@monthem/utils"
import { TransformsStyle, ViewStyle } from "react-native"
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
