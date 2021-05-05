import React from 'react'
import { GestureResponderEvent, LayoutRectangle, LayoutChangeEvent, Pressable, StyleProp, ViewProps, ViewStyle } from 'react-native'
import { useSpring, animated, SpringConfig } from "react-spring/native"

export const ShyView = (props: ShyViewProps) => {
  const {children, style, activeStyleOutput, springConfig, onPress, ..._props} = props;
  const [springs, api] = useSpring(() => {
    return {
      rotateX: "0deg",
      rotateY: "0deg",
      relativeX: 0,
      relativeY: 0,
      scale: 1,
      opacity: 1,
      elevation: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0,
      config: springConfig
    }
  })

  const layout = React.useRef<LayoutRectangle>({
    width: 1, height: 1, x: 0, y: 0,
  })

  const captureLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.height > 0) {
      layout.current = e.nativeEvent.layout
    }
  }

  const onPressIn = (e: GestureResponderEvent) => {
    const {x, y} = getRelativeTouchPos(layout.current, e)
    api.set({relativeX: x, relativeY: y})
    api.start({
      rotateY: springs.relativeX.to({
        output: activeStyleOutput?.rotateY || ["-10deg", "10deg"]
      }),
      rotateX: springs.relativeY.to({
        output: activeStyleOutput?.rotateX || ["20deg", "-20deg"]
      }),
      scale: activeStyleOutput?.scale || 1.05,
      opacity: activeStyleOutput?.opacity || 0.7,
      elevation: 5,
      shadowOffsetX: springs.relativeX.to({
        output: [10, -10]
      }),
      shadowOffsetY: springs.relativeY.to({
        output: [20, -20]
      }),
      shadowOpacity: 0.2,
    })
  }

  const onPressOut = (e: GestureResponderEvent) => {
    api.start({
      rotateX: "0deg",
      rotateY: "0deg",
      scale: 1,
      opacity: 1,
      elevation: 0,
      // shadowOffsetX: 0,
      // shadowOffsetY: 0,
      // shadowOpacity: 0,
    })
  }

  return (
    <animated.View
      onLayout={captureLayout}
      style={[
        {
          transform: [
            {perspective: 1000},
            {rotateX: springs.rotateX},
            {rotateY: springs.rotateY},
            {scale: springs.scale},
          ],
          opacity: springs.opacity,
          borderRadius: 0,
          overflow: "hidden",
          elevation: springs.elevation,
          shadowOffset: {
            width: springs.shadowOffsetX,
            height: springs.shadowOffsetY,
          },
          shadowOpacity: springs.shadowOpacity,
          shadowRadius: 20,
        },
        style,
      ]}
    >
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
        {props.children}
      </Pressable>
    </animated.View>
  )
}

const getRelativeTouchPos = (layout: LayoutRectangle, e: GestureResponderEvent) => {
  const {locationX, locationY} = e.nativeEvent
  return {
    x: locationX / layout.width,
    y: locationY / layout.height,
  }
}

export interface ShyViewProps extends ViewProps {
  children: React.ReactNode
  activeStyleOutput?: {
    scale?: number
    opacity?: number
    rotateX?: [string, string]
    rotateY?: [string, string]
  }
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  springConfig?: SpringConfig
}

