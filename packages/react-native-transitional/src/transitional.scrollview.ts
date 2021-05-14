import React, { Component } from 'react'
import { Animated, ViewProps, ScrollViewProps } from 'react-native'
import { createStyleHolder, getTransitionalStyles, viewStyleInterpolator } from './interpolator'
import { SpringConfig, StyleHolderOf, TransitionConfig } from './types'

export class TransitionalScrollView extends Component<ScrollViewProps & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private styleHolder: StyleHolderOf<ScrollViewProps> = {
    style: createStyleHolder(),
  }
  private progress = 0
  constructor(props: Readonly<ViewProps & { config?: TransitionConfig }>) {
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
    const transitionalStyles = getTransitionalStyles<ScrollViewProps>({
      anim: this.anim,
      interpolator: viewStyleInterpolator,
      progress: this.progress,
      props: this.props,
      styleHolder: this.styleHolder,
      targets: [
        "style",
      ]
    })

    return React.createElement(
      Animated.ScrollView,
      { ..._props, ...transitionalStyles },
      children,
    )
  }
}

export default TransitionalScrollView
