import chroma from 'chroma-js'
import React from 'react'
import { View, Text, Animated, StyleProp, ViewStyle } from 'react-native'
import { Svg, Path } from "react-native-svg"
import { WebColors } from "@monthem/web-color"

const check = `m159.988281 318.582031c-3.988281 4.011719-9.429687 6.25-15.082031 6.25s-11.09375-2.238281-15.082031-6.25l-120.449219-120.46875c-12.5-12.5-12.5-32.769531 0-45.246093l15.082031-15.085938c12.503907-12.5 32.75-12.5 45.25 0l75.199219 75.203125 203.199219-203.203125c12.503906-12.5 32.769531-12.5 45.25 0l15.082031 15.085938c12.5 12.5 12.5 32.765624 0 45.246093zm0 0`
const AnimatedPath = Animated.createAnimatedComponent(Path)
const defaultStyle: ViewStyle = {
  margin: 6
}

export const Check = (props: CheckProps) => {
  const fill = props.anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `rgba(${chroma(props.inactiveColor || WebColors.Grey).rgba()})`,
      `rgba(${chroma(props.activeColor || WebColors.LimeGreen).rgba()})`
    ]
  })
  
  return (
    <Svg style={props.style || defaultStyle} viewBox={"0 -46 417.81333 417"}>
      <AnimatedPath d={check} fill={fill} />
    </Svg>
  )
}

export interface CheckProps {
  /** inputRange should be between 0 and 1 */
  anim: Animated.Value
  style?: StyleProp<ViewStyle>
  inactiveColor?: string
  activeColor?: string
}
