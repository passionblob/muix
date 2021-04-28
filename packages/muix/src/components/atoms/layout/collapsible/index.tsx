import React from 'react'
import {
  View,
  Animated,
  LayoutRectangle,
  LayoutChangeEvent
} from 'react-native'

type CollapsibleState = {
  collapsed: boolean,
  capturedLayout?: LayoutRectangle
}

/**
 * Implemented Animated API.
 * Advantage: Compatibility
 * Disadvantage: It waits until initial content rendered for capturing content Layout.
 */
export class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {
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
    const { onEnd } = this.props
    this.contentContainerHeight.stopAnimation()
    if (this._collapsed) {
      Animated.timing(this.contentContainerHeight, {
        toValue: 0,
        useNativeDriver: false,
      }).start(onEnd?.bind(null, {collapsed: false}))
    } else if (this.state.capturedLayout) {
      Animated.timing(this.contentContainerHeight, {
        toValue: this.state.capturedLayout.height,
        useNativeDriver: false,
      }).start(onEnd?.bind(null, {collapsed: true}))
    }
  }

  render() {
    const {children, header} = this.props
    const collapsed = this._collapsed

    return (
      <View>
        {React.createElement(header, {
          collapsed,
          toggleCollapsed: this._toggleCollapsed.bind(this)
        })}
        <Animated.View style={{
          height: this.state.capturedLayout ? this.contentContainerHeight : undefined,
          overflow: "hidden"
        }}>
          <View onLayout={this._onLayout.bind(this)} ref={this.$container}>
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

  _toggleCollapsed() {
    if (this.props.collapsed !== undefined) return;
    this.setState({
      collapsed: !!!this._collapsed
    })
  }
  
  _onLayout(e: LayoutChangeEvent) {
    const {layout} = e.nativeEvent
    if (layout.height !== 0 && this.state.capturedLayout?.height !== layout.height) {
      this.setState({
        capturedLayout: layout
      })
    }
  }
}

export interface CollapsibleHeaderProps {
  collapsed: boolean
  toggleCollapsed: () => void
}

export interface CollapsibleProps {
  /** override internal state */
  collapsed?: boolean
  initialState?: "collapsed" | "open"
  onEnd?: (state: {collapsed: boolean}) => void
  header: React.ComponentType<CollapsibleHeaderProps>
}

export default Collapsible
