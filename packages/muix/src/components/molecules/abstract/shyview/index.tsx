import React from 'react'
import {
  Animated,
  LayoutChangeEvent,
  ViewProps,
  StyleProp,
  ViewStyle,
  PanResponder,
  GestureResponderEvent,
  Pressable,
} from 'react-native'

export class ShyView extends React.Component<ShyViewProps> {
  private touchAnim = new Animated.Value(0)
  private staticLayout = {width: 0, height: 0}
  private layout = {width: new Animated.Value(1), height: new Animated.Value(1)}
  private locationX = new Animated.Value(0)
  private locationY = new Animated.Value(0)
  private percentageX = Animated.divide(this.locationX, this.layout.width)
  private percentageY = Animated.divide(this.locationY, this.layout.height)

  private onPressIn = (e: GestureResponderEvent) => {
    const {touchAnim, locationY, locationX} = this;
    Animated.timing(touchAnim, {toValue: 1, useNativeDriver: false}).start()
    Animated.parallel([
      Animated.spring(locationX, {toValue: e.nativeEvent.locationX, useNativeDriver: false}),
      Animated.spring(locationY, {toValue: e.nativeEvent.locationY, useNativeDriver: false}),
    ]).start()
  }

  private onPressOut = () => {
    const {touchAnim, locationY, locationX} = this;    
    Animated.timing(touchAnim, {toValue: 0, useNativeDriver: false}).start()
    Animated.parallel([
      Animated.spring(locationX, {toValue: this.staticLayout.width / 2, useNativeDriver: false}),
      Animated.spring(locationY, {toValue: this.staticLayout.height / 2, useNativeDriver: false}),
    ]).start()
  }

  private captureLayout = (e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout
    this.staticLayout = e.nativeEvent.layout
    this.layout.width.setValue(width)
    this.layout.height.setValue(height)
    this.locationX.setValue(width / 2)
    this.locationY.setValue(height / 2)
  }

  render() {
    const {touchAnim, percentageX, percentageY, onPressIn, onPressOut, captureLayout} = this;
    const {children, style, activeStyleOutput, ..._props} = this.props;

    const bindInterpolateInput = (anim: Animated.Value, inputRange: Animated.InterpolationConfigType["inputRange"]) => {
      return (outputRange: Animated.InterpolationConfigType["outputRange"]) => anim.interpolate({
        inputRange,
        outputRange,
        extrapolate: "clamp"
      })
    }

    const interpolateTouchAnim = bindInterpolateInput(touchAnim, [0, 1])

    const scale = interpolateTouchAnim(activeStyleOutput?.scale || [1, 1.05])
    const opacity = interpolateTouchAnim(activeStyleOutput?.opacity || [1, 0.7])
    const elevation = interpolateTouchAnim([0, 5])
    const shadowOpacity = interpolateTouchAnim([0, 0.2])

    const rotateX = percentageY.interpolate({
      inputRange: [0, 1],
      outputRange: activeStyleOutput?.rotateX || ["20deg", "-20deg"],
      extrapolate: "clamp"
    });

    const rotateY = percentageX.interpolate({
      inputRange: [0, 1],
      outputRange: activeStyleOutput?.rotateX || ["-20deg", "20deg"],
      extrapolate: "clamp"
    });

    const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
      opacity: opacity,
      transform: [
        {scale},
        {rotateX},
        {rotateY},
      ],
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity,
      shadowRadius: 10,
      elevation,
    }
    
    return (
      <Animated.View
        {..._props}
        style={[ animatedStyle, style]}
        onLayout={captureLayout}
      >
        <Pressable onPressIn={onPressIn} onPress={this.props.onPress} onPressOut={onPressOut}>
          {children}
        </Pressable>
      </Animated.View>
    )
  }
}

interface ShyViewProps extends ViewProps {
  children: React.ReactNode
  activeStyleOutput?: {
    scale?: [number, number]
    opacity?: [number, number]
    rotateX?: [string, string]
    rotateY?: [string, string]
  }
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

