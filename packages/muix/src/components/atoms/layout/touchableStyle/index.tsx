import React from "react"
import { StyleProp, ViewStyle, Pressable, GestureResponderEvent, ViewProps } from "react-native"
import { Transitional } from "react-native-transitional"

export const TouchableStyle: React.FC<TouchableStyleProps> = (props) => {
  const {
    children,
    styleOnTouch,
    style,
    onPressIn,
    onPressOut,
    onPress,
    ..._props
  } = props

  const [_style, setStyle] = React.useState(style)

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
    <Transitional.View {..._props} style={_style}>
      <Pressable
        onPressIn={_onPressIn}
        onPressOut={_onPressOut}
        onPress={onPress}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </Pressable>
    </Transitional.View>
  )
}

interface TouchableStyleProps extends ViewProps {
  style?: StyleProp<ViewStyle>
  styleOnTouch?: StyleProp<ViewStyle> | ((e: GestureResponderEvent) => StyleProp<ViewStyle>)
  onPressIn?: (e: GestureResponderEvent) => void
  onPressOut?: (e: GestureResponderEvent) => void
  onPress?: (e: GestureResponderEvent) => void
}
