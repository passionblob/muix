import React, { Component } from 'react'
import { Animated, ViewProps, ViewStyle, StyleSheet, SectionListProps } from 'react-native'
import { createStyleHolder, getTransitionalStyles, TransitionalInterpolator } from './interpolator'
import { SpringConfig, StyleHolderOf, TransitionConfig } from './types'

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

export class TransitionalSectionList<Item> extends Component<SectionListProps<Item> & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private styleHolder: StyleHolderOf<SectionListProps<Item>> = {
    style: createStyleHolder(),
    contentContainerStyle: createStyleHolder(),
    hitSlop: createStyleHolder(),
    contentInset: createStyleHolder(),
    scrollIndicatorInsets: createStyleHolder(),
  }
  private progress = 0
  constructor(props: Readonly<SectionListProps<Item> & { config?: TransitionConfig }>) {
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
        ...config,
      }).start()
    } else {
      Animated.spring(this.anim, {
        toValue: 1,
        ...config as SpringConfig,
      }).start()
    }
  }

  render(): React.ReactNode {
    const { children, ..._props } = this.props
    const transitionalStyles = getTransitionalStyles<SectionListProps<Item>>({
      anim: this.anim,
      interpolator,
      progress: this.progress,
      props: this.props,
      styleHolder: this.styleHolder,
      targets: [
        "style",
        "contentContainerStyle",
        "hitSlop",
        "contentInset",
        "scrollIndicatorInsets",
      ]
    })

    return React.createElement(
      Animated.View,
      { ..._props, ...transitionalStyles },
      children,
    )
  }
}

export default TransitionalSectionList
