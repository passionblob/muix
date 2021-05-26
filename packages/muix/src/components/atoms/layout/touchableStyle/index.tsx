import React from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle
} from 'react-native';
import {
  animated,
  SpringConfig,
  useSpring,
  to,
} from '@react-spring/native';
import {
  flattenViewStyle,
  FlatTransform,
  FlatViewStyle,
  InterpolatedTransform,
  InterpolatedViewStyle,
  normalizeFlattenedViewStyle
} from '@monthem/muix/src/utils';
import { wholeStyleProperties } from '@monthem/utils';

export const TouchableStyle: React.FC<TouchableStyleProps> = (props) => {
  const {
    style = {},
    fallbackStyle = {},
    styleOnTouch = {},
    springConfig = {},
    children,
    onPress,
    onPressIn,
    onPressOut,
    ..._viewProps
  } = props
  const _springConfig = "in" in springConfig
    ? springConfig
    : { in: springConfig, out: springConfig }

  const info = React.useRef<TouchStyleCalcInfo>({
    layout: { width: 0, height: 0 }
  })

  const [spring, api] = useSpring(() => ({
    progress: 0,
    locationX: 0,
    locationY: 0,
  }))

  const shouldUpdateTouchStyle = React.useRef(true)
  const touchStyle = React.useRef<FlatViewStyle>()

  const flatFallback = StyleSheet.flatten(fallbackStyle)
  const flatStyle = StyleSheet.flatten(style)
  const flatWhole = flattenViewStyle(StyleSheet.flatten([fallbackStyle, flatStyle]))

  const flattenedFallback = flattenViewStyle(flatFallback)
  const flattenedStyle = flattenViewStyle(flatStyle)

  const transformOnStatic = flattenedStyle.transform || {}
  const transformFallback = flattenedFallback.transform || {}

  const interpolatedTransform = Object.keys(flatWhole.transform || {}).map((transformKey) => {
    const assertedKey = transformKey as keyof FlatTransform
    const fallback = transformFallback[assertedKey]
    const from = transformOnStatic[assertedKey] || transformFallback[assertedKey]
    const interpolation = to([spring.progress, spring.locationX, spring.locationY], () => {
      if (typeof styleOnTouch === "function") {
        if (shouldUpdateTouchStyle.current) {
          shouldUpdateTouchStyle.current = false
          touchStyle.current = flattenViewStyle(StyleSheet.flatten(styleOnTouch(info.current)))
        }
      } else {
        touchStyle.current = flattenViewStyle(StyleSheet.flatten(styleOnTouch)).transform || {}
      }
  
      const flatTransform = touchStyle.current?.transform || {}
      let end: Partial<FlatTransform>[keyof FlatTransform]
      end = flatTransform[assertedKey] || fallback
      end = flatTransform[assertedKey] || fallback
      
      return to([spring.progress, spring.locationX, spring.locationY], () => {
        return spring.progress.to({
          //@ts-ignore
          range: [0, 1],
          output: [from, end],
        }).get()
      }).get()
    })
    return [assertedKey, interpolation] as const
  })
    .reduce((acc, [key, interpolation]) => {
      //@ts-ignore
      acc[key] = interpolation
      return acc
    }, {} as InterpolatedTransform)

  const interpolatedStyle = Object.keys(flatWhole).map((styleKey) => {
    const isNonInterpolableKey = wholeStyleProperties
      .nonInterpolable
      .filter((key) => key === styleKey)
      .length !== 0

    const assertedKey = styleKey as keyof FlatViewStyle
    if (assertedKey === "transform") {
      return [assertedKey, interpolatedTransform] as const
    }

    const fallback = flattenedFallback[assertedKey]
    const from = flattenedStyle[assertedKey] || fallback

    const interpolation = to([spring.progress, spring.locationX, spring.locationY], (_progress) => {
      const index = Math.max(0, Math.min(_progress, 1))

      if (typeof styleOnTouch === "function") {
        if (shouldUpdateTouchStyle.current) {
          shouldUpdateTouchStyle.current = false
          touchStyle.current = flattenViewStyle(StyleSheet.flatten(styleOnTouch(info.current)))
        }
      } else {
        touchStyle.current = flattenViewStyle(StyleSheet.flatten(styleOnTouch))
      }

      const valueOnTouch = (touchStyle.current as FlatViewStyle)[assertedKey] || fallback

      if (isNonInterpolableKey) return index === 0 ? from : valueOnTouch

      return to([spring.progress, spring.locationX, spring.locationY], () => {
        return spring.progress.to({
          //@ts-ignore
          range: [0, 1],
          output: [from, valueOnTouch]
        }).get()
      }).get()
    })
    return [assertedKey, interpolation] as const
  }).reduce((acc, [key, interpolation]) => {
    //@ts-ignore
    acc[key] = interpolation
    return acc
  }, {} as InterpolatedViewStyle)

  const _onPressIn = (e: GestureResponderEvent) => {
    info.current.e = e

    api.start({
      progress: 1,
      config: _springConfig.in,
    })

    if (typeof styleOnTouch === "function") {
      shouldUpdateTouchStyle.current = true
    }

    if (onPressIn) onPressIn(e)
  }

  const _onPressOut = (e: GestureResponderEvent) => {
    api.start({
      progress: 0,
      config: _springConfig.out,
    })

    if (onPressOut) onPressOut(e)
  }

  const onLayout = (e: LayoutChangeEvent) => {
    info.current.layout = e.nativeEvent.layout
  }

  const normalizedStyle = normalizeFlattenedViewStyle(interpolatedStyle)

  return (
    <animated.View
      onLayout={onLayout}
      //@ts-ignore
      style={normalizedStyle}
      {..._viewProps}
      >
      <Pressable
        onPress={onPress}
        onPressIn={_onPressIn}
        onPressOut={_onPressOut}
        style={{
          //@ts-ignore
          userSelect: "none",
          width: "100%",
          height: "100%",
          justifyContent: normalizedStyle.justifyContent?.get(),
          alignItems: normalizedStyle.alignItems?.get(),
          alignContent: normalizedStyle.alignContent?.get(),
          alignSelf: normalizedStyle.alignSelf?.get(),
        }}
      >
        {children}
      </Pressable>
    </animated.View>
  )
}

type TouchStyleCalcInfo = {
  e?: GestureResponderEvent
  layout: {
    width: number,
    height: number,
  }
}

interface TouchableStyleProps extends Omit<ViewProps, "style"> {
  fallbackStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  styleOnTouch?: StyleProp<ViewStyle> | ((info: TouchStyleCalcInfo) => StyleProp<ViewStyle>)
  continuous?: boolean
  onPressIn?: (e: GestureResponderEvent) => void
  onPress?: (e: GestureResponderEvent) => void
  onPressOut?: (e: GestureResponderEvent) => void
  springConfig?: SpringConfig | {
    in: SpringConfig
    out: SpringConfig
  }
}
