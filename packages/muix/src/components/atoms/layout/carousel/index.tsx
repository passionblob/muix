import React, { forwardRef, ForwardRefRenderFunction } from 'react'
import { View, ViewStyle, LayoutChangeEvent, PanResponder, ViewProps, VirtualizedList } from 'react-native'
import { animated } from "react-spring/native"
import { useSpring, useSprings, to, InterpolatorConfig } from "react-spring"
import { anyOf, makeRecords, viewStyleProperties } from "@monthem/utils"

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
      frontPaddingRenderCount = 5,
      backPaddingRenderCount = 5,
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
    const interpolateConfigs = React.useRef<{ [K in CarouselScrollInterpolatorKeys]?: InterpolatorConfig }>({});
    const prevScrollIndex = React.useRef(0);
    const containerRef = React.useRef<View>(null);
    const slicer = React.useRef(getSlicer(0)).current

    function getSlicer(index: number) {
      return {
        start: (index - 1 - frontPaddingRenderCount + items.length) % items.length,
        end: (index - 1 + backPaddingRenderCount) % items.length
      }
    }

    const updateSlideTimestamp = (time?: number) => {
      if (time !== undefined) {
        return lastSlideTimestamp.current = time
      }

      requestAnimationFrame((time) => {
        lastSlideTimestamp.current = time
      })
    }

    const [spring, springApi] = useSpring(() => ({
      virtualTranslate: 0,
    }))

    const [springs, springsApi] = useSprings<{
      [K in CarouselScrollInterpolatorKeys]?: K extends keyof ViewStyle
      ? ViewStyle[K]
      : number
    }>(items.length, (index) => ({
      ...makeRecords(viewStyleProperties.color, undefined),
      ...makeRecords(viewStyleProperties.number, undefined),
      ...makeRecords(viewStyleProperties.length, undefined),
      ...makeRecords(viewStyleProperties.nonInterpolable, undefined),
      flex: 1,
      flexBasis: "100%",
      flexGrow: 1,
      flexShrink: 0,
      zIndex: items.length - index + 1,
      opacity: 0,
      perspective: 1000,
      translateX: 0,
      translateY: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      skewX: 0,
      skewY: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      maxWidth: "100%",
      maxHeight: "100%",
      width: "100%",
      height: "100%",
      position: "absolute",
      overflow: "hidden",
    }))

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
      springsApi.set({ opacity: 1 })
      setTimeout(enableScroll, 0)
      syncToVirtualTranslate()
    }

    const stopScroll = () => {
      if (scrollBlocked.current) return;
      const destination = calcDestination()
      scrollTo(destination, true)
      scrollBlocked.current = true
    }

    const enableScroll = () => {
      if (!scrollBlocked.current) return;
      scrollBlocked.current = false
    }

    const redefineInterpolateConfigs = () => {
      for (const key in springs[0]) {
        if (key in mergedScrollInterpolator) {
          const getConfig = mergedScrollInterpolator[key as CarouselScrollInterpolatorKeys] as NonNullable<CarouselScrollInterpolator[CarouselScrollInterpolatorKeys]>
          interpolateConfigs.current[key as CarouselScrollInterpolatorKeys]
            = getConfig({
              layout: layout.current,
              itemLength: items.length,
            })
        }
      }
    }

    const syncToVirtualTranslate = () => {
      const translatePosition = spring.virtualTranslate.to((value) => {
        return -value / layoutSize.current
      })

      const interpolatedPosition = translatePosition.to((value) => {
        return (
          value % items.length +
          items.length
        ) % items.length
      })

      const progress = interpolatedPosition.to((value) => {
        return value - Math.floor(value)
      })

      const head = Math.floor(interpolatedPosition.get())

      const newOrder = (() => {
        const result: number[] = []
        for (let i = 0; i < items.length; i += 1) {
          result.push((head + i) % items.length)
        }
        return result
      })()

      items.forEach((item, i) => {
        const position = newOrder.indexOf(i)
        const detailedPosition = to([progress], (_progress) => position - _progress)
        const spring = springs[i]

        for (const key in spring) {
          if (key in mergedScrollInterpolator) {
            const config = interpolateConfigs.current[key as CarouselScrollInterpolatorKeys] as InterpolatorConfig
            let interpolated = detailedPosition
              .to(config)
              .get()

            if (key === "zIndex") {
              interpolated = Math.round(interpolated as number)
            }

            spring[key as keyof typeof spring].set(interpolated)
          }
        }
      })
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

    const scrollTo = (translatePosition: number, immediate?: boolean) => {
      updateSlideTimestamp()
      if (immediate) {
        redefineInterpolateConfigs()
        springApi.set({
          virtualTranslate: -translatePosition * layoutSize.current,
        })
        syncToVirtualTranslate()
      } else {
        springApi.start({
          virtualTranslate: -translatePosition * layoutSize.current,
          onChange: syncToVirtualTranslate,
          onResolve: redefineInterpolateConfigs,
        })
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

      const {start, end} = getSlicer(index)
      slicer.start = start
      slicer.end = end

      if (onChange && index !== prevScrollIndex.current) {
        prevScrollIndex.current = index
        onChange(index)
      }
      
      scrollTo(newDestination)
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

        function syncSlide() {
          updateSlideTimestamp()

          const touchDiff = vertical
            ? pageY - touchStart.current
            : pageX - touchStart.current

          const newVirtualTranslate = virtualTranslateStart.current + touchDiff
          springApi.set({
            virtualTranslate: newVirtualTranslate,
          })

          syncToVirtualTranslate()
        }

        syncSlide()
      },
      onPanResponderEnd: (e) => {
        const { identifier, locationX, locationY } = e.nativeEvent
        if (touchID.current !== identifier) return
        touchID.current = "-1"
        const index = calcIndex()
        scrollToIndex(index)
      }
    })

    React.useImperativeHandle(ref, () => ({
      current: containerRef.current,
      scrollTo: scrollToIndex,
      scrollToNext,
      scrollToPrev,
      scrollToRandom,
    }), [])

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
        style={[
          { overflow: "hidden" },
          style,
        ]}
        {..._props}
        ref={containerRef}
        onLayout={onLayout}
        {...panResponder.panHandlers}
        onStartShouldSetResponderCapture={() => true}
        removeClippedSubviews
      >
        {items.map((item, i) => {
          const {
            translateX,
            translateY,
            scale,
            scaleX,
            scaleY,
            rotate,
            rotateX,
            rotateY,
            rotateZ,
            skewX,
            skewY,
            perspective,
            ...itemStyle
          } = springs[i]

          return (
            <animated.View key={i} style={[{
              //@ts-ignore
              userSelect: "none",
              ...itemStyle,
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
            }]}>
              {renderItem(item, i)}
            </animated.View>
          )
        })}
      </View>
    )
  })

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

export interface CarouselRef {
  current: View | null
  scrollTo: (index: number) => void
  scrollToNext: () => number
  scrollToPrev: () => number
  scrollToRandom: () => number
}

export type Carousel = CarouselRef

export type CarouselScrollInterpolatorKeys = keyof Omit<ViewStyle, "transform"> |
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

