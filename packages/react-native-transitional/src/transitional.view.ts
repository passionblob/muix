import React, { Component } from 'react'
import { Animated, ViewProps, ViewStyle, StyleSheet } from 'react-native'
import { TransitionalInterpolator } from './interpolator'
import { TransitionConfig } from './types'

const interpolator = new TransitionalInterpolator<ViewStyle>({
  default: {
    opacity: 1,
  },
  properties: {
    color: [
      "backgroundColor", "borderColor", "borderEndColor",
      "borderLeftColor", "borderRightColor", "borderStartColor",
      "borderTopColor", "borderBottomColor", "shadowColor",
    ],
    number: [
      "borderRadius", "aspectRatio", "borderTopLeftRadius",
      "borderTopRightRadius", "borderBottomLeftRadius",
      "borderBottomRightRadius", "borderBottomWidth",
      "borderRightWidth", "borderLeftWidth", "borderTopWidth",
      "flex", "flexGrow", "flexShrink", "opacity", "rotation",
      "scaleX", "scaleY", "borderWidth", "shadowOpacity",
      "zIndex", "translateX", "translateY", "shadowRadius",
      "borderBottomEndRadius", "borderBottomStartRadius",
      "borderTopStartRadius", "borderTopEndRadius", "elevation",
    ],
    length: [
      "borderStartWidth", "borderEndWidth", "width",
      "height", "margin", "marginBottom", "marginEnd",
      "marginHorizontal", "marginLeft", "marginRight",
      "marginStart", "marginTop", "marginVertical",
      "maxHeight", "maxWidth", "minHeight", "minWidth",
      "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
      "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
      "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
    ],
    nonInterpolable: [
      "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
      "display", "direction", "flexDirection", "flexWrap", "justifyContent", "overflow",
      "position", "borderStyle", "end", "start", "testID",
    ],
    layout: [
      "shadowOffset"
    ]
  }
})

export class TransitionalView extends Component<ViewProps & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private prevStyle?: ViewStyle = {}
  private curStyle?: ViewStyle = {}
  private nextStyle?: ViewStyle = {}
  private progress = 0
  constructor(props: Readonly<ViewProps>) {
    super(props)
    this.anim.addListener(({ value }) => {
      this.progress = value
    })
  }

  componentDidUpdate(): void {
    const { config } = this.props
    this.anim.stopAnimation()
    this.anim.setValue(0)
    Animated.spring(this.anim, {
      toValue: 1,
      useNativeDriver: false,
      ...config,
    }).start()
  }

  render(): React.ReactNode {
    const { style, children, ..._props } = this.props
    const flattend = StyleSheet.flatten(style)

    this.prevStyle = this.curStyle

    this.curStyle = this.prevStyle
      ? interpolator.getInterpolatedStyle(
        this.prevStyle,
        this.nextStyle,
        Math.min(this.progress, 1)
      )
      : flattend

    this.nextStyle = flattend

    const transitionalStyle = interpolator.getTransitionalStyle(
      this.curStyle,
      this.nextStyle,
      this.anim
    )

    return React.createElement(
      Animated.View,
      { style: transitionalStyle, ..._props },
      children,
    )
  }
}

export default TransitionalView
