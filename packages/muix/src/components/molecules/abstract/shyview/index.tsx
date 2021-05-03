import React from 'react'
import {
  Animated,
  LayoutChangeEvent,
  ViewProps,
  StyleProp,
  ViewStyle,
  StyleSheet,
  PanResponder
} from 'react-native'

export class ShyView extends React.Component<ShyViewProps> {
  touchAnim = new Animated.Value(0)
  layout = {width: 300, height: 300}
  locationX = new Animated.Value(0)
  locationY = new Animated.Value(0)

  private panResponder = (() => {
    const {touchAnim, locationY, locationX, layout} = this;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderStart: (e) => {
        locationX.setValue(layout.width / 2)
        locationY.setValue(layout.height / 2)
        Animated.parallel([
          Animated.timing(touchAnim, {toValue: 1, useNativeDriver: false}),
          Animated.spring(locationX, {toValue: e.nativeEvent.locationX, useNativeDriver: false}),
          Animated.spring(locationY, {toValue: e.nativeEvent.locationY, useNativeDriver: false}),
        ]).start()
      },
      onPanResponderMove: (e) => {
        locationX.setValue(e.nativeEvent.locationX)
        locationY.setValue(e.nativeEvent.locationY)
      },
      onPanResponderRelease: (e) => {
        Animated.parallel([
          Animated.timing(touchAnim, {toValue: 0, useNativeDriver: false}),
          Animated.spring(locationX, {toValue: layout.width / 2, useNativeDriver: false}),
          Animated.spring(locationY, {toValue: layout.height / 2, useNativeDriver: false}),
        ]).start()
      }
    })
  })()

  private captureLayout = (e: LayoutChangeEvent) => {
    this.layout = e.nativeEvent.layout
    this.locationX.setValue(this.layout.width / 2)
    this.locationY.setValue(this.layout.height / 2)
  }

  render() {
    const {touchAnim, layout, locationX, locationY, panResponder, captureLayout} = this;
    const {children, style, activeStyleOutput, ..._props} = this.props;
      
    const scale = touchAnim.interpolate({
      inputRange: [0, 1],
      outputRange: activeStyleOutput?.scale || [1, 1.05]
    })
  
    const opacity = touchAnim.interpolate({
      inputRange: [0, 1],
      outputRange: activeStyleOutput?.opacity || [1, 0.7]
    })
  
    const rotateX = locationY.interpolate({
      inputRange: [0, layout.height],
      outputRange: this.layout.width
        ? activeStyleOutput?.rotateX || ["20deg", "-20deg"]
        : ["0deg", "0deg"],
      extrapolate: "clamp"
    })
  
    const rotateY = locationX.interpolate({
      inputRange: [0, layout.width],
      outputRange: this.layout.height
        ? activeStyleOutput?.rotateY || ["-10deg", "10deg"]
        : ["0deg", "0deg"],
      extrapolate: "clamp"
    })
  
    const elevation = touchAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 5]
    })

    const shadowOpacity = touchAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.2]
    })
  
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
        {...panResponder.panHandlers}
        style={[
          animatedStyle,
          style
        ]}
        onLayout={captureLayout}
      >
        {this.props.children}
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
}

