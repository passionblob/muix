import React, { Component } from 'react'
import { Animated, Image, ImageProps, ImageStyle, StyleSheet } from 'react-native'
import { StyleHolderOf, TransitionConfig } from './types'
import { createStyleHolder, getTransitionalStyles, TransitionalInterpolator } from "./interpolator"

const interpolator = new TransitionalInterpolator<ImageStyle>({
  default: {
    opacity: 1,
  },
  properties: {
    color: [
      "backgroundColor", "borderColor",
      "overlayColor", "tintColor", "shadowColor",
    ],
    number: [
      "borderRadius", "aspectRatio", "borderTopLeftRadius",
      "borderTopRightRadius", "borderBottomLeftRadius",
      "borderBottomRightRadius", "borderBottomWidth",
      "borderRightWidth", "borderLeftWidth", "borderTopWidth",
      "flex", "flexGrow", "flexShrink", "opacity", "rotation",
      "scaleX", "scaleY", "borderWidth", "shadowOpacity",
      "zIndex", "translateX", "translateY", "shadowRadius",
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
      "display", "direction", "flexDirection", "flexWrap",
      "justifyContent", "overflow", "position",
      "resizeMode", "end", "start",
    ],
    layout: [
      "shadowOffset"
    ]
  }
})


export class TransitionalImage extends Component<ImageProps & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private styleHolder: StyleHolderOf<ImageProps> = {
    capInsets: createStyleHolder(),
    style: createStyleHolder(),
  }
  private progress = 0
  constructor(props: Readonly<ImageProps>) {
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
    const { children, ..._props } = this.props
    const transitionalStyles = getTransitionalStyles<ImageProps>({
      anim: this.anim,
      interpolator,
      progress: this.progress,
      props: this.props,
      styleHolder: this.styleHolder,
      targets: ["style", "capInsets"]
    })

    return React.createElement(
      Animated.View,
      { ..._props, ...transitionalStyles },
      children,
    )
  }
}

export default TransitionalImage
