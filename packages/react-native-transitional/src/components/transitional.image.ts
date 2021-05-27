import React, { Component } from 'react'
import { Animated, ImageProps } from 'react-native'
import { SpringConfig, StyleHolderOf, TransitionConfig } from '../types'
import { createStyleHolder, getTransitionalStyles, imageStyleInterpolator } from "../interpolator"

export class TransitionalImage extends Component<ImageProps & { config?: TransitionConfig }> {
  private anim = new Animated.Value(1)
  private styleHolder: StyleHolderOf<ImageProps> = {
    style: createStyleHolder(),
  }
  private progress = 0
  constructor(props: Readonly<ImageProps & { config?: TransitionConfig }>) {
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
    const transitionalStyles = getTransitionalStyles<ImageProps>({
      anim: this.anim,
      interpolator: imageStyleInterpolator,
      progress: this.progress,
      props: this.props,
      styleHolder: this.styleHolder,
      targets: ["style"]
    })

    return React.createElement(
      Animated.Image,
      { ..._props, ...transitionalStyles },
      children,
    )
  }
}

export default TransitionalImage
