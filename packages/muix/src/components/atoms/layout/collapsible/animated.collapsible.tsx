import { anyOf } from '@monthem/utils'
import React from 'react'
import {
  View,
  Animated,
  LayoutChangeEvent,
} from 'react-native'
import { CollapsibleProps, CollapsibleState } from './types'

/**
 * Implemented with Animated API.
 * Advantage: Compatibility
 * Disadvantage: It waits until initial content rendered for capturing content Layout.
 */
export class AnimatedCollapsible extends React.Component<Omit<CollapsibleProps, "engine">, CollapsibleState> {
  contentContainerHeight = new Animated.Value(0)
  $container = React.createRef<View>()

  constructor(props: CollapsibleProps) {
    super(props)
    
    if (this._collapsed) {
      this.contentContainerHeight.setValue(0)
    }
  }

  state: CollapsibleState = {
    collapsed: (() => {
      if (this.props.initialState === "collapsed") return true
      if (this.props.initialState === "open") return false
      if (this.props.collapsed !== undefined) return this.props.collapsed
      return true
    })(),
    capturedLayout: undefined
  }

  componentDidUpdate() {
    const { onEnd, contentHeight } = this.props
    this.contentContainerHeight.stopAnimation()
    const onComplete = () => {
      if (this._collapsed) {
        onEnd?.call(null, {collapsed: false})
      } else {
        onEnd?.call(null, {collapsed: true})
      }
    }

    if (this._collapsed) {
      Animated.timing(this.contentContainerHeight, {
        toValue: 0,
        useNativeDriver: false,
      }).start(onComplete)
    } else {
      if (contentHeight) {
        Animated.timing(this.contentContainerHeight, {
          toValue: contentHeight,
          useNativeDriver: false,
        }).start(onComplete)
      } else if (this.state.capturedLayout) {
        Animated.timing(this.contentContainerHeight, {
          toValue: this.state.capturedLayout.height,
          useNativeDriver: false,
        }).start(onComplete)
      }
    }
  }

  render() {
    const {children, header, style, contentHeight} = this.props
    const collapsed = this._collapsed

    const height = (() => {
      if (contentHeight) return this.contentContainerHeight
      if (this.state.capturedLayout) return this.contentContainerHeight
      return undefined
    })()

    return (
      <View style={style}>
        {React.createElement(header, {
          collapsed,
          toggleCollapsed: this._toggleCollapsed
        })}
        <Animated.View style={{ height, overflow: "hidden" }}>
          <View onLayout={this._onLayout} ref={this.$container}>
            {children}
          </View>
        </Animated.View>
      </View>
    )
  }

  get _collapsed(): boolean {
    return this.props.collapsed === undefined
      ? this.state.collapsed
      : this.props.collapsed
  }

  _toggleCollapsed = () => {
    if (this.props.collapsed !== undefined) return;
    this.setState({
      collapsed: !!!this._collapsed
    })
  }
  
  _onLayout = (e: LayoutChangeEvent) => {
    const {contentHeight} = this.props
    if (contentHeight !== undefined) return;
    const {layout} = e.nativeEvent
    if (layout.height !== 0 && this.state.capturedLayout?.height !== layout.height) {
      this.setState({
        capturedLayout: layout
      })
    }
  }
}

export default AnimatedCollapsible
