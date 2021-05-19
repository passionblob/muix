import React, { forwardRef } from 'react';
import { storiesOf } from '@storybook/react-native';
import { Easing, LayoutChangeEvent, PanResponder, Text, TextInput, TouchableOpacity, View, ViewProps, ViewStyle } from 'react-native';
import { animated } from '@react-spring/native';
import { useSpring, useSprings, to, InterpolatorConfig } from 'react-spring';
import WebColors from '@monthem/web-color';
import { makeRecords, viewStyleProperties, getRandomEntry } from "@monthem/utils"

type CarouselScrollInterpolatorKeys = keyof Omit<ViewStyle, "transform"> |
  "zIndex" | "opacity" | "shadowOffsetX" | "shadowOffsetY" |
  "perspective" | "translateX" | "translateY" | "scale" | "scaleX" |
  "scaleY" | "rotate" | "rotateX" | "rotateY" | "rotateZ" |
  "skewX" | "skewY"

type CarouselInterpolatorInfo = {
  layout: { width: number, height: number }
  itemLength: number
}

type CarouselScrollInterpolator = {
  [K in CarouselScrollInterpolatorKeys]?: (info: CarouselInterpolatorInfo) => InterpolatorConfig
}

const plainHorizontalScrollInterpolator: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, carouselItemCount - 1],
    output: [-1 * info.layout.width, (carouselItemCount - 1) * info.layout.width],
  })
}

const plainVerticalScrollInterpolator: CarouselScrollInterpolator = {
  translateY: (info) => ({
    range: [-1, carouselItemCount - 1],
    output: [-1 * info.layout.height, (carouselItemCount - 1) * info.layout.height],
  })
}

const Carousel = forwardRef<Carousel, CarouselProps>((props, ref) => {
  const {
    children,
    vertical,
    style,
    auto = true,
    scrollInterpolator = vertical
      ? plainVerticalScrollInterpolator
      : plainHorizontalScrollInterpolator,
    autoInterval = 3000,
    ..._props
  } = props;

  const items = React.Children.toArray(children)
  const touchID = React.useRef("-1");
  const touchStart = React.useRef(0);
  const virtualTranslateStart = React.useRef(0);
  const progress = React.useRef(0);
  const layoutSize = React.useRef(0);
  const layout = React.useRef({ width: 0, height: 0 });
  const threshold = vertical ? 20 : 30
  const lastSlideTimestamp = React.useRef(0);
  const scrollBlocked = React.useRef(false);
  const interpolateConfigs = React.useRef<{[K in CarouselScrollInterpolatorKeys]?: InterpolatorConfig}>({});

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

  const [springs, springsApi] = useSprings<{ [K in CarouselScrollInterpolatorKeys]?: K extends keyof ViewStyle ? ViewStyle[K] : number }>(items.length, (index) => ({
    ...makeRecords(viewStyleProperties.color, undefined),
    ...makeRecords(viewStyleProperties.number, undefined),
    ...makeRecords(viewStyleProperties.length, undefined),
    ...makeRecords(viewStyleProperties.nonInterpolable, undefined),
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
    width: "100%",
    height: "100%",
    position: "absolute",
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
      if (key in scrollInterpolator) {
        interpolateConfigs.current[key] = scrollInterpolator[key as CarouselScrollInterpolatorKeys]({
          layout: layout.current,
          itemLength: items.length,
        })
      }
    }
  }

  const syncToVirtualTranslate = () => {
    const translatePosition = -spring.virtualTranslate.get() / layoutSize.current

    const interpolatedPosition = (
      translatePosition % items.length +
      items.length
    ) % items.length

    progress.current = interpolatedPosition - Math.floor(interpolatedPosition)

    const head = Math.floor(interpolatedPosition)

    const newOrder = (() => {
      const result: number[] = []
      for (let i = 0; i < items.length; i += 1) {
        result.push((head + i) % items.length)
      }
      return result
    })()

    springs.forEach((spring, i) => {
      const position = newOrder.indexOf(i)
      const detailedPosition = to([], () => position - progress.current)

      for (const key in spring) {
        if (key in scrollInterpolator) {
          let interpolated = detailedPosition
            .to(interpolateConfigs.current[key])
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

  const convertDestinationToIndex = (destination: number) => {
    let result = destination

    while (result < 0) {
      result += items.length
    }

    return result % items.length
  }

  const scrollTo = (translatePosition: number, immediate?: boolean) => {
    updateSlideTimestamp()
    redefineInterpolateConfigs()
    if (immediate) {
      springApi.set({
        virtualTranslate: -translatePosition * layoutSize.current,
      })
      syncToVirtualTranslate()
    } else {
      springApi.start({
        virtualTranslate: -translatePosition * layoutSize.current,
        onChange: syncToVirtualTranslate,
      })
    }
  }

  const scrollToPrev = () => {
    const destination = calcDestination()
    const index = convertDestinationToIndex(destination)
    scrollTo(destination - 1)
    return index
  }

  const scrollToNext = () => {
    const destination = calcDestination()
    const index = convertDestinationToIndex(destination)
    scrollTo(destination + 1)
    return index
  }

  const scrollToIndex = (index: number) => {
    const curDestination = calcDestination()
    const curIndex = convertDestinationToIndex(curDestination)
    const diff = index - curIndex
    const newDestination = curDestination + diff
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
      const { identifier, locationX, locationY } = e.nativeEvent
      touchID.current = identifier
      touchStart.current = vertical ? locationY : locationX
      virtualTranslateStart.current = spring.virtualTranslate.get()
    },
    onPanResponderMove: (e) => {
      const { identifier, locationX, locationY } = e.nativeEvent
      if (touchID.current !== identifier) return

      function syncSlide() {
        updateSlideTimestamp()

        const touchDiff = vertical
          ? locationY - touchStart.current
          : locationX - touchStart.current

        springApi.set({
          virtualTranslate: virtualTranslateStart.current + touchDiff,
        })

        syncToVirtualTranslate()
      }

      syncSlide()
    },
    onPanResponderEnd: (e) => {
      const { identifier, locationX, locationY } = e.nativeEvent
      if (touchID.current !== identifier) return
      touchID.current = "-1"
      const destination = calcDestination()
      scrollTo(destination)
    }
  })

  React.useImperativeHandle(ref, () => ({
    scrollTo: scrollToIndex,
    scrollToNext,
    scrollToPrev,
    scrollToRandom,
  }))

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
      onLayout={onLayout}
      {...panResponder.panHandlers}
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
        } = springs[i] as { [K in CarouselScrollInterpolatorKeys]?: K extends keyof ViewStyle ? ViewStyle[K] : number }
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
            {item}
          </animated.View>
        )
      })}
    </View>
  )
})

interface CarouselProps extends ViewProps {
  initialIndex?: number
  vertical?: boolean
  children?: React.ReactNode
  auto?: boolean
  autoInterval?: number
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

interface CarouselRef {
  scrollTo: (index: number) => void
  scrollToNext: () => number
  scrollToPrev: () => number
  scrollToRandom: () => number
}

type Carousel = CarouselRef


const carouselItemCount = 5

const exampleInterpolator: CarouselScrollInterpolator = {
  translateX: (info) => {
    const { width = 300 } = info.layout
    return {
      range: [-1, carouselItemCount - 1],
      output: [-1 * width, (carouselItemCount - 1) * width]
    }
  }
}

const getRandomColorCarouselItem = () => {
  const backgroundColor = getRandomEntry(WebColors).value

  return Array(carouselItemCount)
    .fill(0)
    .map((_, i) => (
      <View
        key={i}
        style={{
          backgroundColor,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Text
          style={{
            backgroundColor: "black",
            padding: 10,
            color: "white",
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          {i}
        </Text>
      </View>
    ))
}

const CarouselStory = () => {
  const carouselRefs = React.useRef<Carousel[]>([])

  const scrollToRandom = () => {
    carouselRefs.current.forEach((carousel) => carousel.scrollToRandom())
  }

  const scrollToPrev = () => {
    carouselRefs.current.forEach((carousel) => carousel.scrollToPrev())
  }

  const scrollToNext = () => {
    carouselRefs.current.forEach((carousel) => carousel.scrollToNext())
  }

  return (
    <View>
      <Carousel
        ref={(_ref) => carouselRefs.current.push(_ref)}
        scrollInterpolator={exampleInterpolator}
        style={{ height: 100, backgroundColor: "lightgrey" }}
      >
        {getRandomColorCarouselItem()}
      </Carousel>
      <Carousel
        ref={(_ref) => carouselRefs.current.push(_ref)}
        vertical
        style={{ height: 100, backgroundColor: "lightgrey" }}
      >
        {getRandomColorCarouselItem()}
      </Carousel>
      <Carousel
        ref={(_ref) => carouselRefs.current.push(_ref)}
        scrollInterpolator={customScrollInterpolator1}
        style={{ height: 100, backgroundColor: "lightgrey" }}
      >
        {getRandomColorCarouselItem()}
      </Carousel>
      <Carousel
        ref={(_ref) => carouselRefs.current.push(_ref)}
        scrollInterpolator={customScrollInterpolator2}
        style={{ height: 300, backgroundColor: "lightgrey" }}
      >
        {getRandomColorCarouselItem()}
      </Carousel>
      <Carousel
        ref={(_ref) => carouselRefs.current.push(_ref)}
        scrollInterpolator={customScrollInterpolator3}
        style={{ height: 300, backgroundColor: "lightgrey" }}
      >
        {getRandomColorCarouselItem()}
      </Carousel>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={scrollToRandom}>
          <Text style={{ fontSize: 40, padding: 20, borderWidth: 1 }}>Random</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToPrev}>
          <Text style={{ fontSize: 40, padding: 20, borderWidth: 1 }}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToNext}>
          <Text style={{ fontSize: 40, padding: 20, borderWidth: 1 }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const customScrollInterpolator1: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, info.itemLength - 1],
    output: [-info.layout.width, (info.itemLength - 1) * info.layout.width],
  }),
  scale: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [0.5, 1, 0.5, 0]
  }),
}

const customScrollInterpolator2: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, info.itemLength - 1],
    output: [- Math.random() * info.layout.width * 0.5 - info.layout.width * 0.5, -25, 25],
  }),
  translateY: (info) => ({
    range: [-1, 0, info.itemLength - 1],
    output: [Math.random() * 60 - 30, -5, 10],
  }),
  opacity: (info) => ({
    range: [-1, 0, info.itemLength - 2, info.itemLength - 1],
    output: [0, 1, 0.8, 0]
  }),
  zIndex: (info) => ({
    range: [-1, info.itemLength - 1],
    output: [info.itemLength + 1, 1],
  }),
  scale: (info) => ({
    range: [-1, info.itemLength - 1],
    output: [0.8, 0.8]
  }),
}

const customScrollInterpolator3: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [-info.layout.width, 0, 100, info.layout.width * (info.itemLength - 1)],
  }),
  opacity: (info) => ({
    range: [-1, 0, info.itemLength - 2, info.itemLength - 1],
    output: [0, 1, 0, 0]
  }),
  zIndex: (info) => ({
    range: [-1, info.itemLength - 1],
    output: [info.itemLength + 1, 1],
  }),
  // scale: (info) => ({
  //   range: [-1, info.itemLength - 1],
  //   output: [0.8, 0.8]
  // }),
}

storiesOf("Atoms/Layout", module)
  .add("Carousel", () => <CarouselStory />)

