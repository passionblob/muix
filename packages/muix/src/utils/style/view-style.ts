import { ViewStyle } from "react-native"
import { anyOf } from "@monthem/utils"
import {
  flattenTransform,
  normalizeFlattenedTransform,
  FlatViewStyle,
} from "./common"

export type FlatViewStyleShape = { [K in keyof FlatViewStyle]: any }

export const flattenViewStyle = (style: ViewStyle): FlatViewStyle => {
  const {
    transform,
    shadowOffset,
    ...plainStyle
  } = style
  return {
    ...plainStyle,
    ...(transform ? {
      transform: flattenTransform(transform)
    } : {}),
    ...(shadowOffset ? {
      shadowOffsetX: shadowOffset?.width,
      shadowOffsetY: shadowOffset?.height,
    } : {})
  }
}

export const normalizeFlattenedViewStyle = <T extends FlatViewStyleShape>(flattened: T) => {
  const { shadowOffsetX, shadowOffsetY, transform, ...rest } = flattened
  const normalizedTransform = transform ? normalizeFlattenedTransform(transform) : undefined
  const shadowOffset = anyOf([
    shadowOffsetX,
    shadowOffsetY,
  ]) ? {
    width: shadowOffsetX,
    height: shadowOffsetY
  } : undefined
  return {
    shadowOffset,
    transform: normalizedTransform,
    ...rest
  }
}
