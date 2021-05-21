import React, { forwardRef, ForwardRefRenderFunction } from 'react'
import { View, ViewStyle, LayoutChangeEvent, PanResponder, ViewProps, VirtualizedList } from 'react-native'
import { animated, Interpolation } from "react-spring/native"
import { useSpring, useSprings, to, InterpolatorConfig } from "react-spring"
import { anyOf, isAllTrue, makeRecords, viewStyleProperties } from "@monthem/utils"

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
      vertical,
      style,
      auto = false,
      hideInactive = false,
      frontPaddingRenderCount = 1,
      backPaddingRenderCount = 6,
      items,
      renderItem,
      scrollInterpolator = vertical
        ? plainVerticalScrollInterpolator
        : plainHorizontalScrollInterpolator,
      autoInterval = 3000,
      onChange,
      ..._props
    } = props;

    const mergedScrollInterpolator = {
      ...(hideInactive ? hideInactiveInterpolator : {}),
      ...scrollInterpolator,
    }

    const touchID = React.useRef("-1");
    const touchStart = React.useRef(0);
    const virtualTranslateStart = React.useRef(0);
    const layoutSize = React.useRef(0);
    const layout = React.useRef({ width: 0, height: 0 });
    const threshold = vertical ? 20 : 30
    const lastSlideTimestamp = React.useRef(0);
    const scrollBlocked = React.useRef(false);
    const prevScrollIndex = React.useRef(0);
    const containerRef = React.useRef<View>(null);
    const slicer = React.useRef(getSlicer(0))
    const initialized = React.useRef(false)
    const [dummyState, setDummyState] = React.useState(0)

    const [spring, springApi] = useSpring(() => ({
      virtualTranslate: 0,
    }))

    const transitionPosition = spring.virtualTranslate.to((value) => {
      if (layoutSize.current <= 0) return 0
      const translatePosition = -value / layoutSize.current
      return (
        translatePosition % items.length +
        items.length
      ) % items.length
    })

    const slicedItems = getSliced()

    function getSlicer(index: number) {
      return {
        start: (index - frontPaddingRenderCount + items.length) % items.length,
        end: (index + backPaddingRenderCount) % items.length
      }
    }

    function getSliced() {
      const itemsWithIndex = items.map((item, i) => ({
        item,
        originalIndex: i
      }))
      const _slicer = slicer.current
      return _slicer.start > _slicer.end
        ? itemsWithIndex.slice(_slicer.start).concat(itemsWithIndex.slice(0, _slicer.end))
        : _slicer.start === _slicer.end
          ? itemsWithIndex.slice(0, _slicer.start).concat(itemsWithIndex.slice(_slicer.end))
          : itemsWithIndex.slice(_slicer.start, _slicer.end)
    }

    function forceUpdate() {
      setDummyState(dummyState + 1)
    }

    const updateSlideTimestamp = (time?: number) => {
      if (time !== undefined) {
        return lastSlideTimestamp.current = time
      }

      requestAnimationFrame((time) => {
        lastSlideTimestamp.current = time
      })
    }

    const onLayout = (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout
      layout.current.width = width
      layout.current.height = height
      layoutSize.current = vertical ? height : width

      const prevLayoutSize = layoutSize.current

      if (prevLayoutSize > 0) {
        springApi.set({
          virtualTranslate: spring.virtualTranslate.get() * (layoutSize.current / prevLayoutSize)
        })
      }

      stopScroll()
      setTimeout(enableScroll, 0)

      if (!initialized.current) {
        initialized.current = true
        forceUpdate()
      }
    }

    const stopScroll = () => {
      if (scrollBlocked.current) return;
      const destination = calcDestination()
      scrollToPosition(destination, true)
      scrollBlocked.current = true
    }

    const enableScroll = () => {
      if (!scrollBlocked.current) return;
      scrollBlocked.current = false
    }

    const calcDestination = () => {
      const detailedTranslatePosition = -spring.virtualTranslate.get() / layoutSize.current
      const detailedStartTransitionPosition = -virtualTranslateStart.current / layoutSize.current
      const diff = detailedTranslatePosition - detailedStartTransitionPosition
      const translatePosition = (() => {
        const base = Math.round(detailedTranslatePosition)
        const diffInPx = Math.abs(diff) * layoutSize.current
        if (diffInPx < threshold) return base
        if (Math.abs(diff) >= 0.5) return base
        return diff > 0 ? base + 1 : base - 1
      })()
      return translatePosition
    }

    const calcIndex = () => {
      const destination = calcDestination()
      return convertDestinationToIndex(destination)
    }

    const convertDestinationToIndex = (destination: number) => {
      let result = destination

      while (result < 0) {
        result += items.length
      }

      return result % items.length
    }

    const scrollToPosition = (translatePosition: number, immediate?: boolean) => {
      updateSlideTimestamp()

      const virtualTranslate = -translatePosition * layoutSize.current

      if (immediate) {
        springApi.set({virtualTranslate})
      } else {
        springApi.start({virtualTranslate})
      }
    }

    const scrollToPrev = () => {
      const index = calcIndex() - 1
      scrollToIndex(index)
      return index
    }

    const scrollToNext = () => {
      const index = calcIndex() + 1
      scrollToIndex(index)
      return index
    }

    const scrollToIndex = (index: number) => {
      const curDestination = calcDestination()
      const curIndex = convertDestinationToIndex(curDestination)
      const diff = index - curIndex
      const newDestination = curDestination + diff

      slicer.current = getSlicer(index)

      forceUpdate()
      if (onChange && index !== prevScrollIndex.current) {
        prevScrollIndex.current = index
        onChange(index)
      }

      scrollToPosition(newDestination)
    }

    const getRandomItemIndex = () => Math.floor(Math.random() * items.length)

    const scrollToRandom = () => {
      const destination = convertDestinationToIndex(calcDestination())
      let randomIndex = getRandomItemIndex();
      while (randomIndex === destination) randomIndex = getRandomItemIndex()
      scrollToIndex(randomIndex)
      return randomIndex
    }

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderStart: (e) => {
        if (touchID.current !== "-1") return;
        const { identifier, pageX, pageY } = e.nativeEvent
        touchID.current = identifier

        touchStart.current = vertical ? pageY : pageX
        virtualTranslateStart.current = spring.virtualTranslate.get()
      },
      onPanResponderMove: (e) => {
        const { identifier, pageX, pageY } = e.nativeEvent
        if (touchID.current !== identifier) return

        updateSlideTimestamp()

        const touchDiff = vertical
          ? pageY - touchStart.current
          : pageX - touchStart.current

        springApi.set({
          virtualTranslate:
            virtualTranslateStart.current +
            touchDiff,
        })
      },
      onPanResponderEnd: (e) => {
        const { identifier } = e.nativeEvent
        if (touchID.current !== identifier) return
        touchID.current = "-1"

        const index = calcIndex()
        scrollToIndex(index)
      }
    })

    React.useImperativeHandle(ref, () => {
      return {
        current: containerRef.current,
        scrollTo: scrollToIndex,
        scrollToNext,
        scrollToPrev,
        scrollToRandom,
      }
    }, [dummyState])

    React.useEffect(() => {
      const tick = (time: number) => {
        requestAnimationFrame(tick)
        if (scrollBlocked.current) return;
        if (!layoutSize.current) return;
        if (time - lastSlideTimestamp.current < autoInterval) return;
        updateSlideTimestamp(time)
        scrollToNext()
      }

      if (auto) requestAnimationFrame(tick)
    }, [])

    return (
      <View
        {..._props}
        {...panResponder.panHandlers}
        ref={containerRef}
        onLayout={onLayout}
        style={[{ overflow: "hidden" }, style]}
      >
        {slicedItems.map(({ item, originalIndex }) => {
          return (
            <MemoizedItem
              item={item}
              key={originalIndex}
              renderItem={renderItem}
              originalIndex={originalIndex}
              transitionPosition={transitionPosition}
              interpolator={mergedScrollInterpolator}
              info={{
                layout: {
                  width: layout.current.width,
                  height: layout.current.height,
                },
                itemLength: items.length
              }}
            />
          )
        })}
      </View>
    )
  })

const CarouselItem: <TItem>(props: CarouselItemProps<TItem>) => React.ReactElement | null = (props) => {
  const {
    originalIndex,
    item,
    renderItem,
    transitionPosition,
    interpolator,
    info,
  } = props;

  if (info.layout.width <= 0 || info.layout.height <= 0) return null

  const itemPosition = transitionPosition.to((value) => {
    return (originalIndex - value + info.itemLength) % info.itemLength - 1
  })

  const configs = Object.entries(interpolator)
    .map(([key, getConfig], i) => {
      const config = (getConfig as NonNullable<typeof getConfig>)(info)
      const interpolated = itemPosition.to(config)
      return [key, interpolated] as const
    })
    .reduce((acc, [key, interpolated]) => {
      acc[key as CarouselScrollInterpolatorKeys] = interpolated
      return acc
    }, {} as { [K in CarouselScrollInterpolatorKeys]: Interpolation })

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
      {renderItem(item, originalIndex)}
    </animated.View>
  )
}

const MemoizedItem = React.memo(CarouselItem, (prev, next) => {
  return isAllTrue([
    prev.info.itemLength === next.info.itemLength,
    prev.info.layout.width === next.info.layout.width,
    prev.info.layout.height === next.info.layout.height,
    prev.originalIndex === next.originalIndex,
  ])
})


export interface CarouselRef {
  current: View | null
  scrollTo: (index: number) => void
  scrollToNext: () => number
  scrollToPrev: () => number
  scrollToRandom: () => number
}

export type Carousel = CarouselRef

export type CarouselScrollInterpolatorKeys = keyof Omit<ViewStyle, "transform" | "shadowOffset" | "transformMatrix"> |
  "zIndex" | "opacity" | "shadowOffsetX" | "shadowOffsetY" |
  "perspective" | "translateX" | "translateY" | "scale" | "scaleX" |
  "scaleY" | "rotate" | "rotateX" | "rotateY" | "rotateZ" |
  "skewX" | "skewY"

export type CarouselInterpolatorInfo = {
  layout: { width: number, height: number }
  itemLength: number
}

export type CarouselScrollInterpolator = {
  [K in CarouselScrollInterpolatorKeys]?: (info: CarouselInterpolatorInfo) => InterpolatorConfig
}

export interface CarouselProps<TItem extends any> extends ViewProps {
  initialIndex?: number
  vertical?: boolean
  auto?: boolean
  autoInterval?: number
  hideInactive?: boolean
  frontPaddingRenderCount?: number
  backPaddingRenderCount?: number
  ref?: React.Ref<Carousel>
  items: TItem[]
  renderItem: (item: TItem, index: number) => React.ReactNode
  onChange?: (index: number) => void
  /**
   * this defines scroll behavior
   * @example
   * 
   * translateX: (info) => ({
   *  range: [-1, carouselItemCount - 1],
   *  output: [-1 * info.layout.width, (carouselItemCount - 1) * info.layout.width],
   * })
   * 
   * @param range this starts from -1 to children.length - 1
   * 
   */
  scrollInterpolator?: CarouselScrollInterpolator
}

type CarouselItemProps<TItem extends any> = {
  item: CarouselProps<TItem>["items"][number]
  renderItem: CarouselProps<TItem>["renderItem"]
  originalIndex: number
  transitionPosition: Interpolation<number, number>
  interpolator: CarouselScrollInterpolator
  info: CarouselInterpolatorInfo
}