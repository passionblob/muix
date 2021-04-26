import React, { Component } from 'react'
import { Animated, TextProps, TextStyle, StyleSheet } from 'react-native'
import { createStyleHolder, getTransitionalStyles, TransitionalInterpolator } from './interpolator'
import { SpringConfig, StyleHolderOf, TransitionConfig } from './types'

const interpolator = new TransitionalInterpolator<TextStyle>({
  default: {
    opacity: 1,
    fontSize: 10,
  },
  properties: {
    color: [
      "backgroundColor", "borderColor", "borderEndColor",
      "borderLeftColor", "borderRightColor", "borderStartColor",
      "borderTopColor", "color", "textDecorationColor",
      "textShadowColor", "borderBottomColor", "shadowColor",
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
      "fontSize", "lineHeight", "textShadowRadius", "letterSpacing",
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
      "display", "direction", "flexDirection", "flexWrap", "fontFamily",
      "fontStyle", "includeFontPadding", "justifyContent", "overflow",
      "position", "textAlign", "textAlignVertical",
      "textDecorationLine", "textDecorationStyle", "writingDirection",
      "borderStyle", "end", "start", "testID", "fontVariant", "fontWeight",
      "textTransform",
    ],
    layout: [
      "shadowOffset", "textShadowOffset"
    ]
  }
})

export class TransitionalText extends Component<TextProps & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private styleHolder: StyleHolderOf<TextProps> = {
    style: createStyleHolder(),
  }

  private progress = 0
  constructor(props: Readonly<TextProps & { config?: TransitionConfig }>) {
    super(props)
    this.anim.addListener(({ value }) => {
      this.progress = value
    })
  }

  componentDidUpdate(): void {
    const { config } = this.props

    this.anim.stopAnimation()
    this.anim.setValue(0)

    if (config?.type === "timing") {
      Animated.timing(this.anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: config.useNativeDriver || false,
        ...config,
      }).start(config.onTransitionEnd)
    } else {
      Animated.spring(this.anim, {
        toValue: 1,
        useNativeDriver: config?.useNativeDriver || false,
        ...config as SpringConfig,
      }).start(config?.onTransitionEnd)
    }
  }

  render(): React.ReactNode {
    const { children, ..._props } = this.props
    const transitionalStyles = getTransitionalStyles<TextProps>({
      anim: this.anim,
      interpolator,
      progress: this.progress,
      props: this.props,
      styleHolder: this.styleHolder,
      targets: ["style"]
    })

    return React.createElement(
      Animated.Text,
      { ..._props, ...transitionalStyles },
      children,
    )
  }
}

export default TransitionalText
