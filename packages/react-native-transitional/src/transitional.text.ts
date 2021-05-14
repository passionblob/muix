import React, { Component } from 'react'
import { Animated, TextProps } from 'react-native'
import { createStyleHolder, getTransitionalStyles, textStyleInterpolator } from './interpolator'
import { SpringConfig, StyleHolderOf, TransitionConfig } from './types'

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
      interpolator: textStyleInterpolator,
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
