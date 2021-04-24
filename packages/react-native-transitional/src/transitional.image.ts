import React, { Component } from 'react'
import { Animated, ImageProps, ImageStyle, StyleSheet } from 'react-native'
import { TransitionConfig } from './types'
import { getInterpolatedStyle, getTransitionalStyle } from "./image-interpolator"

export class TransitionalImage extends Component<ImageProps & {config?: TransitionConfig}> {
  private anim = new Animated.Value(1)
  private prevStyle?: ImageStyle
  private nextStyle?: ImageStyle
  private progress = 0
  constructor(props: Readonly<ImageProps>) {
      super(props)
      this.anim.addListener(({value}) => {
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
    const {style, children, ..._props} = this.props
    const flattend = StyleSheet.flatten(style)
    this.prevStyle = this.prevStyle
    //@ts-ignore
      ? getInterpolatedStyle(this.prevStyle, this.nextStyle, Math.min(this.progress, 1))
      : flattend
    this.nextStyle = flattend
    //@ts-ignore
    const transitionalStyle = getTransitionalStyle(this.prevStyle, this.nextStyle, this.anim)
    return React.createElement(
      Animated.Image,
      {style: transitionalStyle, ..._props},
      children,
    )
  }
}

export default TransitionalImage
