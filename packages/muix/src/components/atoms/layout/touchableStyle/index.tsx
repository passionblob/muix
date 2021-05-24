import React from "react"
import { StyleProp, ViewStyle, Pressable, GestureResponderEvent, ViewProps } from "react-native"
import { Transitional } from "react-native-transitional"

export * from "./index.spring"

export const TouchableStyle: React.FC<TouchableStyleProps> = (props) => {
  const {
    children,
    styleOnTouch,
    style = {},
    onPressIn,
    onPressOut,
    onPress,
    ..._props
  } = props

  const [_style, setStyle] = React.useState<StyleProp<ViewStyle>>(style)

  const _onPressIn = (e: GestureResponderEvent) => {
    if (onPressIn) onPressIn(e)
    if (typeof styleOnTouch === "function") {
      setStyle(styleOnTouch(e))
    } else {
      setStyle(styleOnTouch)
    }
  }

  const _onPressOut = (e: GestureResponderEvent) => {
    if (onPressOut) onPressOut(e)
    setStyle(style)
  }

  return (
    //@ts-ignore
    <Transitional.View {..._props} style={_style}>
      <Pressable
        onPressIn={_onPressIn}
        onPressOut={_onPressOut}
        onPress={onPress}
        //@ts-ignore
        style={{ width: "100%", height: "100%", userSelect: "none" }}
      >
        {children}
      </Pressable>
    </Transitional.View>
  )
}

export interface TouchableStyleProps extends ViewProps {
  style?: StyleProp<ViewStyle>
  styleOnTouch?: StyleProp<ViewStyle> | ((e: GestureResponderEvent) => StyleProp<ViewStyle>)
  onPressIn?: (e: GestureResponderEvent) => void
  onPressOut?: (e: GestureResponderEvent) => void
  onPress?: (e: GestureResponderEvent) => void
}
