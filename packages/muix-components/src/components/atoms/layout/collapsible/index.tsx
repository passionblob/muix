import React from 'react'
import {
  View,
  Animated,
  LayoutRectangle
} from 'react-native'

export class Collapsible extends React.Component<CollapsibleProps, {collapsed?: boolean}> {
  contentContainerHeight = new Animated.Value(0)
  $container = React.createRef<View>()

  get _collapsed(): boolean {
    return this.props.collapsed === undefined
      ? this.state.collapsed
      : this.props.collapsed
  }

  state = {
    collapsed: (() => {
      if (this.props.initialState === "collapsed") return true
      if (this.props.initialState === "open") return false
      if (this.props.collapsed !== undefined) return this.props.collapsed
      return true
    })()
  }

  async componentDidMount() {
    this.contentContainerHeight.setValue(0)
    if (this._collapsed) {
      this.contentContainerHeight.setValue(0)
    } else {
      const layout = await this._measure()
      this.contentContainerHeight.setValue(layout.height)
    }
  }

  componentDidUpdate() {
    this.animate()
  }

  async animate(config?: Omit<Animated.TimingAnimationConfig, "toValue" | "useNativeDriver">) {
    this.contentContainerHeight.stopAnimation()
    if (this._collapsed) {
      Animated.timing(this.contentContainerHeight, {
        toValue: 0,
        useNativeDriver: false,
        ...config,
      }).start()
    } else {
      const layout = await this._measure()
      Animated.timing(this.contentContainerHeight, {
        toValue: layout.height,
        useNativeDriver: false,
        ...config,
      }).start()
    }
  }
  
  async _measure() {
    return new Promise<LayoutRectangle & {pageX: number, pageY: number}>((resolve) => {
      this.$container.current?.measure((x, y, width, height, pageX, pageY) => {
        resolve({x, y, width, height, pageX, pageY})
      })
    })
  }

  _toggleCollapsed() {
    if (this.props.collapsed !== undefined) return;
    this.setState({
      collapsed: !!!this._collapsed
    })
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
          height: this.contentContainerHeight,
          overflow: "hidden"
        }}>
          <Animated.View ref={this.$container}>
            {children}
          </Animated.View>
        </Animated.View>
      </View>
    )
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
  header: React.ComponentType<CollapsibleHeaderProps>
}

export default Collapsible
