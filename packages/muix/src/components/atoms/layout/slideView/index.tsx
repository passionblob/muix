import React from 'react'
import { ViewProps, PanResponder, StyleSheet } from 'react-native'
import { animated, useSpring, SpringValues } from '@react-spring/native'
import { mapWithDefaultValue } from "@monthem/utils"

const defaultRadius = 50

export const SlideView: React.FC<SlideViewProps> = ({
  style,
  onStartShouldSetResponder,
  onMoveShouldSetResponder,
  onResponderMove,
  onResponderStart,
  onResponderEnd,
  disableHorizontalSlide,
  disableVerticalSlide,
  snapPoints = [],
  onSnap,
  onSlide,
  ..._props
}) => {
  const cleanSnapPoints = snapPoints.map((point) => mapWithDefaultValue(point, {
    radius: point.radius || defaultRadius,
    translateX: 0,
    translateY: 0,
    key: "",
    distanceFromOrigin: Math.sqrt(
      Math.pow(point.translateX || 0, 2) +
      Math.pow(point.translateY || 0, 2)
    )
  }))

  const touchID = React.useRef(-1);

  const record = React.useRef({
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
  }).current

  const snappedPoint = React.useRef<Required<SlideViewSnapPoint> & {distance: number}>()

  const [spring, setSpring] = useSpring<SlideViewSpring>(() => {
    return {
      translateX: 0,
      translateY: 0,
    }
  })

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderStart: (e) => {
      if (touchID.current !== -1) return;
      const {identifier, pageX, pageY} = e.nativeEvent
      touchID.current = Number(identifier)
      record.startX = pageX
      record.startY = pageY
      record.startTranslateX = spring.translateX.get()
      record.startTranslateY = spring.translateY.get()
    },
    onPanResponderMove: (e) => {
      const {identifier, pageX, pageY} = e.nativeEvent
      if (Number(identifier) !== touchID.current) return;
      setSpring.start({
        translateX: disableHorizontalSlide
          ? 0
          : record.startTranslateX + pageX - record.startX,
        translateY: disableVerticalSlide
          ? 0
          : record.startTranslateY + pageY - record.startY,
        onChange: () => {
          if (onSlide) onSlide({
            x: spring.translateX.get(),
            y: spring.translateY.get(),
          })    
        }
      })
    },
    onPanResponderEnd: (e) => {
      const {identifier} = e.nativeEvent
      if (Number(identifier) !== touchID.current) return;
      touchID.current = -1;

      let snapPointX;
      let snapPointY;

      const nearestSnapPoint = getNearestSnapPoint(cleanSnapPoints, {
          translateX: spring.translateX.get(),
          translateY: spring.translateY.get()
        }
      )

      if (snappedPoint.current) {
        const diffX = spring.translateX.get() - snappedPoint.current.translateX;
        const diffY = spring.translateY.get() - snappedPoint.current.translateY;
        const distanceFromSnappedPoint = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        if (distanceFromSnappedPoint > snappedPoint.current.radius) {
          snappedPoint.current = undefined
          snapPointX = 0
          snapPointY = 0
        } else {
          snapPointX = snappedPoint.current.translateX
          snapPointY = snappedPoint.current.translateY
        }
      }

      if (nearestSnapPoint) {
        snappedPoint.current = nearestSnapPoint
        snapPointX = nearestSnapPoint.translateX
        snapPointY = nearestSnapPoint.translateY
        if (onSnap) onSnap(nearestSnapPoint)
      }

      setSpring.start({
        translateX: snapPointX || 0,
        translateY: snapPointY || 0,
        onChange: () => {
          if (onSlide) onSlide({
            x: spring.translateX.get(),
            y: spring.translateY.get(),
          })
        }
      })
    }
  })

  return (
    <animated.View
      {...panResponder.panHandlers}
      {..._props}
      style={[
        style,
        {
          transform: [
            {translateX: spring.translateX},
            {translateY: spring.translateY},
          ],
        },
      ]}
    />
  )
}

// If there's no snap point within in-radius, returns undefined
const getNearestSnapPoint = (
  snapPoints: Required<SlideViewSnapPoint & {distanceFromOrigin: number}>[],
  view: {translateX: number, translateY: number}
) => {
  const distanceFromOrigin = Math.sqrt(
    Math.pow(view.translateX, 2) +
    Math.pow(view.translateY, 2)
  )

  return snapPoints
    .map((point) => {
      const diffX = point.translateX - view.translateX
      const diffY = point.translateY - view.translateY
      const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2))
      return {...point, distance}
    })
    .sort((pointA, pointB) => pointA.distance - pointB.distance)
    .filter((point) => {
      return [
        point.distance < point.radius,
        distanceFromOrigin > point.distanceFromOrigin
      ].find((val) => !!val)
    })
    .shift()
}

type SlideViewSnapPoint = {
  translateX?: number
  translateY?: number
  radius?: number
  key?: string
}

type SlideViewSpring = {
  translateX: number
  translateY: number
}

export interface SlideViewProps extends ViewProps {
  disableHorizontalSlide?: boolean
  disableVerticalSlide?: boolean
  snapPoints?: SlideViewSnapPoint[]
  onSnap?: (point: SlideViewSnapPoint) => void
  onSlide?: (translate: {x: number, y: number}) => void
}