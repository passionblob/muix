import { textStyleProperties } from '@monthem/utils'
import React, { forwardRef } from 'react'
import { TextStyle, View, ViewStyle } from 'react-native'
import { SpringConfig, animated, Interpolation, useTrail } from "@react-spring/native"
import { CarouselBase, CarouselBaseInterpolatorInfo, CarouselBaseProps, CarouselBaseRenderItemInfo } from "@monthem/muix"

const defaultMicroChunkInterpolator: MicronChunkInterpolatorFn<any> = ({ info, chunkIndex, chunks, item, props }) => {
  return {
    fontSize: [12, 20, 12],
  }
}

const defaultChunkInterpolatorHorizontal: ChunkInterpolatorFn<any> = ({ info }) => {
  return {
    opacity: [0, 1, 0],
    translateX: [-30, 0, 30],
    translateY: [30, 0, 30],
    rotateY: ["-120deg", "0deg", "120deg"],
    config: {
      tension: 300,
      bounce: 0,
    }
  }
}

const defaultChunkInterpolatorVertical: ChunkInterpolatorFn<any> = ({ info }) => {
  return {
    opacity: [-1, 1, -1],
    translateY: [-20, 0, 20],
    rotateX: ["-120deg", "0deg", "120deg"],
    config: {
      tension: 300,
      bounce: 0,
    }
  }
}

export const ChoiceSlider
: <T extends any>(props: ChoiceSliderProps<T>) => (React.ReactElement<any, string | React.JSXElementConstructor<any>> | null)
= forwardRef<CarouselBase, ChoiceSliderProps<any>>((props, ref) => {
  const {
    choices,
    microChunkInterpolator = defaultMicroChunkInterpolator,
    chunkInterpolator = props.vertical
      ? defaultChunkInterpolatorVertical
      : defaultChunkInterpolatorHorizontal,
    alignChunks,
    ..._props
  } = props
  
  return (
    <CarouselBase
      {..._props}
      ref={ref}
      items={choices}
      infinite={false}
      frontPaddingRenderCount={2}
      backPaddingRenderCount={2}
      renderItem={({ item, itemPosition, index, info }) => {
        const chunkTexts = item.map((chunk) => {
          if (Array.isArray(chunk)) return chunk.map(mapChunkBaseToString).join(" ")
          return mapChunkBaseToString(chunk)
        })

        const textChunks = item.map((chunk) => {
          if (Array.isArray(chunk)) return chunk.map(mapChunkBaseToString).map((_, i) => i > 0 ? " " + _ : _)
          return [mapChunkBaseToString(chunk)]
        })

        const [trail, _] = useTrail(item.length, (i) => {
          const { config, from, ...style } = mapChunkBaseToInterpolation({
            chunk: textChunks[i],
            chunkTexts,
            chunkIndex: i,
            chunkInterpolator,
            index,
            info,
            item,
            itemPosition,
          })
          return {
            config,
            from,
            ...style,
          }
        })

        const springs = item.map((chunk, chunkIndex) => {
          if (Array.isArray(chunk)) {
            return chunk.map((_c, i) => mapChunkBaseToInterpolation({
              chunkIndex, chunk, chunkChildIndex: i,
              chunkInterpolator: microChunkInterpolator, chunkTexts,
              index, info, item, itemPosition,
            }))
          }

          return [mapChunkBaseToInterpolation({
            chunkIndex, chunk, chunkChildIndex: -1,
            chunkInterpolator: microChunkInterpolator, chunkTexts,
            index, info, item, itemPosition,
          })]
        })

        return (
          <View
            key={index}
            style={{
              //@ts-ignore
              userSelect: "none",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
            }}>
            <View style={{ alignItems: alignChunks }}>
              {textChunks.map((chunk, i) => {
                const {
                  plainStyles,
                  shadowOffset,
                  transform
                } = extractCustomKeysFromFlatStyle(trail[i])
                return (
                  <animated.View
                    key={i}
                    //@ts-ignore
                    style={{
                      ...plainStyles,
                      shadowOffset,
                      transform,
                      flexDirection: "row",
                    }}
                  >
                    {chunk.map((text, j) => {
                      const spring = springs[i][j]
                      const {
                        plainStyles,
                        shadowOffset,
                        textShadowOffset,
                        transform
                      } = extractCustomKeysFromFlatStyle(spring)

                      return (
                        <animated.Text
                          key={j}
                          //@ts-ignore
                          style={{
                            ...plainStyles,
                            shadowOffset,
                            textShadowOffset,
                            transform
                          }}>
                          {text}
                        </animated.Text>
                      )
                    })}
                  </animated.View>
                )
              })}
            </View>
          </View>
        )
      }}
    />
  )
})

const fontWeightToNumber = (weight: TextStyle["fontWeight"]) => {
  if (weight === "bold") return 700
  if (weight === "normal") return 400
  return Number(weight)
}

const mapChunkBaseToString = <T extends any>(c: ChunkBase<T>) => {
  if (typeof c === "string") return c
  return c.value
}

const extractPropsFromChunkBase = <T extends any>(c: ChunkBase<T>) => {
  if (typeof c === "string") return {}
  return c.props || {}
}

type SpringConfigExtractorParams<T> = {
  chunkIndex: number,
  chunk: ChunkBase<T> | ChunkBase<T>[],
  chunkChildIndex?: number,
  chunkInterpolator: ChunkInterpolatorFn<T>,
  info: CarouselBaseInterpolatorInfo,
  item: Choice<T>,
  index: number,
  itemPosition: Interpolation<number, number>,
  chunkTexts: string[]
}

const mapChunkBaseToInterpolation = <T extends any>({
  chunk,
  chunkIndex,
  chunkInterpolator,
  chunkTexts,
  chunkChildIndex = 0,
  index,
  info,
  item,
  itemPosition,
}: SpringConfigExtractorParams<T>) => {
  const chunkText = (() => {
    return Array.isArray(chunk)
      ? chunk.map(mapChunkBaseToString).join("")
      : mapChunkBaseToString(chunk)
  })()

  const text = (() => {
    return Array.isArray(chunk)
      ? mapChunkBaseToString(chunk[chunkChildIndex])
      : chunkText
  })()

  const props = (() => {
    return Array.isArray(chunk)
      ? extractPropsFromChunkBase(chunk[chunkChildIndex])
      : extractPropsFromChunkBase(chunk)
  })()

  const { config, from, ...styles } = chunkInterpolator({
    info,
    item,
    itemIndex: index,
    itemPosition,
    chunkIndex,
    chunk: chunkText,
    chunks: chunkTexts,
    text,
    props,
  })

  const reduced = Object.keys(styles)
    .map((key) => {
      const assertedKey = key as keyof typeof styles
      const output = styles[assertedKey] as NonNullable<typeof styles[typeof assertedKey]>

      if (!Array.isArray(output)) return [assertedKey, output] as const

      const interpolation = (() => {
        if (key === "fontWeight") {
          return itemPosition.to((position) => {
            const numberWeights = (output as TextStyle["fontWeight"][]).map(fontWeightToNumber)
            const origin = Number(numberWeights[1])
            const left = Number(numberWeights[0])
            const right = Number(numberWeights[2])
            const interpolated = position >= 0
              ? origin + Math.floor((right - origin) * position / 100) * 100
              : origin + Math.floor((origin - left) * position / 100) * 100
            const clamped = Math.max(100, Math.min(interpolated, 900))
            return String(clamped)
          })
        }

        //@ts-ignore
        if (textStyleProperties.nonInterpolable.includes(key)) {
          return itemPosition.to((position) => {
            const floor = Math.floor(position)
            return output[floor + 1]
          })
        }

        return itemPosition.to({
          //@ts-ignore
          range: [-1, 0, 1],
          output,
        })
      })()

      return [assertedKey, interpolation] as const
    })
    .reduce((acc, [key, interpolation]) => {
      Object.assign(acc, { [key]: interpolation })
      return acc
    }, {} as {
      [K in keyof FlatTextStyle]: Interpolation<number, FlatTextStyle[K]> | FlatTextStyle[K]
    })

  return {
    ...reduced,
    config,
    from,
  }
}

function extractCustomKeysFromFlatStyle
  <T extends Partial<Record<keyof FlatTextStyle | keyof ChunkInterpolatorConfig, any>>>
  (style: T) {
  const {
    perspective,
    translateX, translateY,
    rotate, rotateX, rotateY, rotateZ,
    skewX, skewY,
    scale, scaleY, scaleX,
    shadowOffsetX, shadowOffsetY,
    textShadowOffsetX, textShadowOffsetY,
    config, from,
    ...plainStyles
  } = style

  const transform = {
    perspective,
    translateX, translateY,
    rotate, rotateX, rotateY, rotateZ,
    skewX, skewY,
    scale, scaleY, scaleX,
  }

  const textShadowOffset = {
    width: textShadowOffsetX,
    height: textShadowOffsetY,
  }

  const shadowOffset = {
    width: shadowOffsetX,
    height: shadowOffsetY,
  }

  return {
    transform: Object.keys(transform)
      .filter((key): key is keyof FlatTransform => {
        return transform[key as keyof FlatTransform] !== undefined
      })
      .map((key) => ({ [key]: transform[key] })),
    shadowOffset,
    textShadowOffset,
    plainStyles,
  }
}

export type ChoiceChunkInterpolatorInfo<T> = Omit<CarouselBaseRenderItemInfo<Choice<T>>, "index"> & {
  itemIndex: number
  chunkIndex: number
  text: string
  chunk: string
  chunks: string[]
  props: Partial<T>
}

type FlatTextStyleKeys = keyof Omit<TextStyle,
  "transform" |
  "shadowOffset" |
  "matrix" |
  "textShadowOffset"
>

type FlatViewStyleKeys = keyof Omit<ViewStyle,
  "transform" |
  "shadowOffset" |
  "matrix" |
  "textShadowOffset"
>

type FlatTransform = {
  translateX: number
  translateY: number
  rotate: string
  rotateX: string
  rotateY: string
  rotateZ: string
  skewX: string
  skewY: string
  perspective: number
  scale: number
  scaleX: number
  scaleY: number
}

type FlatViewStyle = {
  [K in FlatViewStyleKeys]: ViewStyle[K]
} & FlatTransform
  & {
    shadowOffsetX: number
    shadowOffsetY: number
  }

type FlatTextStyle = {
  [K in FlatTextStyleKeys]: TextStyle[K]
} & FlatTransform
  & {
    shadowOffsetX: number
    shadowOffsetY: number
    textShadowOffsetX: number
    textShadowOffsetY: number
  }

type MicroChunkInterpolatorConfig = {
  [K in keyof FlatTextStyle]?: [
    NonNullable<FlatTextStyle[K]>,
    NonNullable<FlatTextStyle[K]>,
    NonNullable<FlatTextStyle[K]>,
  ] | NonNullable<FlatTextStyle[K]>
}

type ChunkInterpolatorConfig = {
  from?: Partial<FlatViewStyle>
  config?: SpringConfig
} & {
    [K in keyof FlatViewStyle]?: [
      NonNullable<FlatViewStyle[K]>,
      NonNullable<FlatViewStyle[K]>,
      NonNullable<FlatViewStyle[K]>,
    ] | NonNullable<FlatViewStyle[K]>
  }



type ChunkBase<T> = (
  string | { value: string, props?: T }
)
type Choice<T> = (ChunkBase<T> | ChunkBase<T>[])[]

type MicronChunkInterpolatorFn<T> = (info: ChoiceChunkInterpolatorInfo<T>) => MicroChunkInterpolatorConfig
type ChunkInterpolatorFn<T> = (info: ChoiceChunkInterpolatorInfo<T>) => ChunkInterpolatorConfig

type ChoiceSliderRef = CarouselBase
export type ChoiceSlider = ChoiceSliderRef

export type ChoiceSliderProps<T> = {
  alignChunks?: ViewStyle["alignItems"]
  choices: Choice<T>[]
  chunkInterpolator?: ChunkInterpolatorFn<T>
  microChunkInterpolator?: MicronChunkInterpolatorFn<T>
} & Omit<CarouselBaseProps<T>,
  "items" |
  "renderItem" |
  "infinite" |
  "frontPaddingRenderCount" |
  "backPaddingRenderCount"
>