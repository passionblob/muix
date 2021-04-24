import React, { Component } from 'react'
import { Animated, ViewProps, ViewStyle, StyleSheet, FlatList, FlatListProps } from 'react-native'
import { createStyleHolder, getTransitionalStyles, TransitionalInterpolator } from './interpolator'
import { StyleHolderOf, TransitionConfig } from './types'

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

export class TransitionalFlatList<Item> extends Component<FlatListProps<Item> & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private styleHolder: StyleHolderOf<FlatListProps<Item>> = {
    ListFooterComponentStyle: createStyleHolder(),
    ListHeaderComponentStyle: createStyleHolder(),
    columnWrapperStyle: createStyleHolder(),
    contentContainerStyle: createStyleHolder(),
    contentInset: createStyleHolder(),
    hitSlop: createStyleHolder(),
    style: createStyleHolder(),
    scrollIndicatorInsets: createStyleHolder(),
  }

  private progress = 0
  constructor(props: Readonly<FlatListProps<Item>>) {
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
    const transitionalStyles = getTransitionalStyles<FlatListProps<Item>>({
      anim: this.anim,
      interpolator,
      progress: this.progress,
      props: this.props,
      styleHolder: this.styleHolder,
      targets: [
        "ListFooterComponentStyle",
        "ListHeaderComponentStyle",
        "columnWrapperStyle",
        "contentContainerStyle",
        "contentInset",
        "hitSlop",
        "scrollIndicatorInsets",
        "style"
      ]
    })

    return React.createElement(
      Animated.View,
      { ..._props, ...transitionalStyles },
      children,
    )
  }
}

export default TransitionalFlatList
