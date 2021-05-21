import React, { forwardRef } from 'react'
import { View, ViewStyle, LayoutChangeEvent, PanResponder, ViewProps } from 'react-native'
import { Interpolation } from "react-spring/native"
import { useSpring, to, InterpolatorConfig } from "react-spring"
import { isAllTrue } from "@monthem/utils"

export const CarouselBase
  : <TItem extends any>(props: CarouselBaseProps<TItem>) => (React.ReactElement<any, string | React.JSXElementConstructor<any>> | null)
  = forwardRef<CarouselBase, CarouselBaseProps<any>>((props, ref) => {
    const {
      vertical,
      style,
      auto = false,
      frontPaddingRenderCount = 1,
      backPaddingRenderCount = 6,
      items,
      renderItem,
      autoInterval = 3000,
      onChange,
      ..._props
    } = props;

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
    const timer = React.useRef<NodeJS.Timeout>();
    const [newDestination, setNewDestination] = React.useState(0)
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
        springApi.set({ virtualTranslate })
      } else {
        springApi.start({ virtualTranslate })
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

      if (onChange && index !== prevScrollIndex.current) {
        prevScrollIndex.current = index
        onChange(index)
      }

      setNewDestination(newDestination)
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
        current: {
          ...containerRef.current,
          scrollTo: scrollToIndex,
          scrollToNext,
          scrollToPrev,
          scrollToRandom,
        },
      }
    })

    React.useEffect(() => {
      if (auto) {
        timer.current = setInterval(() => {
          requestAnimationFrame((time: number) => {
            if (scrollBlocked.current) return;
            if (!layoutSize.current) return;
            if (time - lastSlideTimestamp.current < autoInterval) return;
            updateSlideTimestamp(time)
            scrollToNext()
          })
        }, autoInterval)
      }

      return () => {
        if (timer.current !== undefined) {
          clearInterval(timer.current)
        }
      }
    })

    React.useEffect(() => {
      scrollToPosition(newDestination)
    }, [newDestination])

    React.useEffect(() => {
      return () => {
        scrollBlocked.current = true
      }
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

const CarouselBaseItem: <TItem>(props: CarouselBaseItemProps<TItem>) => React.ReactElement | null = (props) => {
  const {
    info,
    item,
    renderItem,
    originalIndex,
    transitionPosition,
  } = props;

  if (info.layout.width <= 0 || info.layout.height <= 0) return null

  const itemPosition = transitionPosition.to((value) => {
    return (originalIndex - value + info.itemLength) % info.itemLength - 1
  })

  return (
    <>
      {renderItem({
        item,
        index: originalIndex,
        itemPosition,
        info,
      })}
    </>
  )
}

const MemoizedItem = React.memo(CarouselBaseItem, (prev, next) => {
  return isAllTrue([
    prev.info.itemLength === next.info.itemLength,
    prev.info.layout.width === next.info.layout.width,
    prev.info.layout.height === next.info.layout.height,
    prev.originalIndex === next.originalIndex,
  ])
})

export interface CarouselBaseRef {
  current: (Partial<View> & {
    scrollTo: (index: number) => void
    scrollToNext: () => number
    scrollToPrev: () => number
    scrollToRandom: () => number
  }) | null
}

export type CarouselBase = CarouselBaseRef

export type CarouselBaseInterpolatorInfo = {
  layout: { width: number, height: number }
  itemLength: number
}

export type CarouselBaseRenderItemInfo<TItem> = {
  item: TItem
  index: number
  itemPosition: Interpolation<number, number>
  info: CarouselBaseInterpolatorInfo
}

export interface CarouselBaseProps<TItem extends any> extends ViewProps {
  ref?: React.Ref<CarouselBase>
  auto?: boolean
  autoInterval?: number
  vertical?: boolean
  items: TItem[]
  frontPaddingRenderCount?: number
  backPaddingRenderCount?: number
  renderItem: (info: CarouselBaseRenderItemInfo<TItem>) => React.ReactNode
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
}

type CarouselBaseItemProps<TItem extends any> = {
  item: CarouselBaseProps<TItem>["items"][number]
  renderItem: CarouselBaseProps<TItem>["renderItem"]
  originalIndex: number
  transitionPosition: Interpolation<number, number>
  info: CarouselBaseInterpolatorInfo
}