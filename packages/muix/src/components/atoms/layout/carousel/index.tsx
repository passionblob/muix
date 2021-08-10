import React, { forwardRef } from 'react'
import { ViewStyle } from 'react-native'
import { animated, to, InterpolatorConfig } from "@react-spring/native"
import { CarouselBase, CarouselBaseProps, CarouselBaseRef } from "./base"

export * from "./base"

const plainHorizontalScrollInterpolator: CarouselScrollInterpolator = {
  translateX: (info: CarouselInterpolatorInfo) => ({
    range: [-1, info.itemLength - 1],
    output: [-1 * info.layout.width, (info.itemLength - 1) * info.layout.width],
  })
}

const plainVerticalScrollInterpolator: CarouselScrollInterpolator = {
  translateY: (info: CarouselInterpolatorInfo) => ({
    range: [-1, info.itemLength - 1],
    output: [-1 * info.layout.height, (info.itemLength - 1) * info.layout.height],
  })
}

const hideInactiveInterpolator: CarouselScrollInterpolator = {
  opacity: (info: CarouselInterpolatorInfo) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [0, 1, 0, 0]
  })
}

export const Carousel
  : <TItem extends any>(props: CarouselProps<TItem>) => (React.ReactElement<any, string | React.JSXElementConstructor<any>> | null)
  = forwardRef<Carousel, CarouselProps<any>>((props, ref) => {
    const {
      scrollInterpolator = props.vertical
        ? plainVerticalScrollInterpolator
        : plainHorizontalScrollInterpolator,
      hideInactive,
      renderItem,
      items,
      ..._props
    } = props;

    const mergedScrollInterpolator = {
      ...(hideInactive ? hideInactiveInterpolator : {}),
      ...scrollInterpolator,
    }

    const _renderItem = (meta: Parameters<CarouselProps<any>["renderItem"]>[0]) => {
      const { info, itemPosition } = meta

      const configs = Object.entries(mergedScrollInterpolator)
        .map(([key, getConfig], i) => {
          const config = (getConfig as NonNullable<typeof getConfig>)(info)
          let interpolated;
          if (typeof config === "object" && "range" in config) {
            interpolated = itemPosition.to(config)
            if (key === "zIndex") {
              interpolated = interpolated.to((value) => Math.floor(value as number))
            }
          } else {
            interpolated = config
          }
          return [key, interpolated] as const
        })
        .reduce((acc, [key, interpolated]) => {
          acc[key as CarouselScrollInterpolatorKeys] = interpolated
          return acc
        }, {} as { [K in CarouselScrollInterpolatorKeys]: any })

      const {
        perspective = 1000,
        translateX = 0,
        translateY = 0,
        scale = 1,
        scaleX = 1,
        scaleY = 1,
        rotate = 0,
        rotateX = 0,
        rotateY = 0,
        rotateZ = 0,
        skewX = 0,
        skewY = 0,
        shadowOffsetX,
        shadowOffsetY,
        ...itemStyle
      } = configs;

      return (
        <animated.View style={[
          {
            //@ts-ignore
            userSelect: "none",
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            zIndex: itemPosition.to((value) => Math.floor(info.itemLength - value)),
            shadowOffset: {
              width: shadowOffsetX,
              height: shadowOffsetY,
            }
          },
          {
            transform: [
              { perspective },
              { translateX },
              { translateY },
              { scale },
              { scaleX },
              { scaleY },
              { rotate: to(rotate, (value) => `${value}deg`) },
              { rotateX: to(rotateX, (value) => `${value}deg`) },
              { rotateY: to(rotateY, (value) => `${value}deg`) },
              { rotateZ: to(rotateZ, (value) => `${value}deg`) },
              { skewX: to(skewX, (value) => `${value}deg`) },
              { skewY: to(skewY, (value) => `${value}deg`) },
            ]
          },
          itemStyle,
        ]}>
          {renderItem(meta)}
        </animated.View>
      )
    }

    return (
      <CarouselBase
        {..._props}
        ref={ref}
        items={items}
        renderItem={_renderItem}
      />
    )
  })


export type Carousel = CarouselBaseRef

export type CarouselScrollInterpolatorKeys = keyof Omit<ViewStyle, "transform" | "shadowOffset" | "transformMatrix"> |
  "zIndex" | "opacity" | "shadowOffsetX" | "shadowOffsetY" |
  "perspective" | "translateX" | "translateY" | "scale" | "scaleX" |
  "scaleY" | "rotate" | "rotateX" | "rotateY" | "rotateZ" |
  "skewX" | "skewY"

export type CarouselInterpolatorInfo = {
  layout: { width: number, height: number }
  itemLength: number
}

type CustomStyle = {
  shadowOffsetX: number
  shadowOffsetY: number
}

export type CarouselScrollInterpolator = {
  [K in CarouselScrollInterpolatorKeys]?: (info: CarouselInterpolatorInfo) => K extends keyof ViewStyle
    ? ViewStyle[K] | InterpolatorConfig
    : K extends keyof CustomStyle
    ? CustomStyle[K] | InterpolatorConfig
    : InterpolatorConfig
}

export interface CarouselProps<TItem extends any> extends CarouselBaseProps<TItem> {
  hideInactive?: boolean
  scrollInterpolator?: CarouselScrollInterpolator
}
