import React from 'react'
import {
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
  ViewProps,
  PanResponder,
  LayoutChangeEvent,
  PanResponderGestureState,
  StyleSheet
} from 'react-native'
import { SpringValue, to, useSpring } from "react-spring"
import { animated } from "react-spring/native"
import { flattenViewStyle, FlatViewStyle } from "../../../../utils"

export const TouchableStyle2: React.FC<TouchableStyle2Props> = (props) => {
  const {
    children,
    style = {},
    styleOnTouch,
    onPress,
    onPressIn,
    onPressOut,
    onLayout,
    onStartShouldSetResponder,
    onResponderMove,
    onResponderEnd,
    onResponderStart,
    ..._props
  } = props;

  const touchID = React.useRef("-1");
  const layout = React.useRef({ width: 0, height: 0 });
  const [spring, api] = useSpring(() => ({
    progress: 0,
    touchX: 0,
    touchY: 0,
  }))

  const _onLayout = (e: LayoutChangeEvent) => {
    layout.current = e.nativeEvent.layout
    if (onLayout) onLayout(e)
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: onStartShouldSetResponder || (() => true),
    onPanResponderStart: (e, gestureState) => {
      const { locationX, locationY } = e.nativeEvent
      if (onResponderStart) onResponderStart(e)
      if (touchID.current !== "-1") return;
      api.start({ progress: 1 })
      api.set({
        touchX: locationX,
        touchY: locationY,
      })
      const { identifier } = e.nativeEvent
      touchID.current = identifier
    },
    onPanResponderMove: (e, gestureState) => {
      if (onResponderMove) onResponderMove(e)
      const { identifier, locationX, locationY } = e.nativeEvent
      if (touchID.current !== identifier) return;
      api.set({
        touchX: locationX,
        touchY: locationY,
      })
    },
    onPanResponderEnd: (e) => {
      if (onResponderEnd) onResponderEnd(e)
      const { identifier, locationY, locationX } = e.nativeEvent
      if (touchID.current !== identifier) return;
      touchID.current = "-1"
      api.start({ progress: 0 })
      api.set({
        touchX: locationX,
        touchY: locationY,
      })
    }
  })

  return (
    <animated.View
      //@ts-ignore
      style={[style, { userSelect: "none" }]}
      {...panResponder.panHandlers}
      onLayout={_onLayout}
      {..._props}
    >
      {children}
    </animated.View>
  )
}

type TouchableStyleEventInfo = {
  e?: GestureResponderEvent
  gestureState?: PanResponderGestureState
  layout?: { width: number, height: number }
}

export interface TouchableStyle2Props extends ViewProps {
  style?: StyleProp<ViewStyle>
  styleOnTouch?: StyleProp<ViewStyle> | ((info: TouchableStyleEventInfo) => StyleProp<ViewStyle>)
  onPressIn?: (e: GestureResponderEvent) => void
  onPressOut?: (e: GestureResponderEvent) => void
  onPress?: (e: GestureResponderEvent) => void
}
