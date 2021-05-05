// import React from 'react'
// import {
//   LayoutChangeEvent,
//   ViewProps,
//   StyleProp,
//   ViewStyle,
//   StyleSheet,
//   Pressable,
//   GestureResponderEvent
// } from 'react-native'
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   interpolate,
//   Extrapolate,
//   withSpring,
// } from 'react-native-reanimated'

// export const ShyView = (props: ShyViewProps) => {
//   const {children, style, activeStyleOutput, springConfig, onPress, ..._props} = props;
//   const sharedValue = useSharedValue(0);
//   const layout = useSharedValue({
//     width: 0,
//     height: 0,
//   })
//   const svX = useSharedValue(0);
//   const svY = useSharedValue(0);

//   const captureLayout = (e: LayoutChangeEvent) => {
//     layout.value = e.nativeEvent.layout
//   }

//   const onPressIn = (e: GestureResponderEvent) => {
//     sharedValue.value = 1
//     svX.value = layout.value.width / 2
//     svY.value = layout.value.height / 2
//     svX.value = withSpring(e.nativeEvent.locationX, springConfig)
//     svY.value = withSpring(e.nativeEvent.locationY, springConfig)

//     if (_props.onResponderStart) _props.onResponderStart(e)
//   }

//   const onPressOut = (e: GestureResponderEvent) => {
//     sharedValue.value = 0

//     if (_props.onResponderEnd) _props.onResponderEnd(e)
//   }

//   const animatedStyle = useAnimatedStyle(() => {
//     "worklet";
    
//     const touching = sharedValue.value === 1
//     const scale = interpolate(
//       sharedValue.value,
//       [0, 1],
//       activeStyleOutput?.scale || [1, 1.05]
//     );
  
//     const opacity = interpolate(
//       sharedValue.value,
//       [0, 1],
//       activeStyleOutput?.opacity || [1, 0.7]
//     );
  
//     const rotateX = interpolate(
//       svY.value,
//       [0, layout.value.height],
//       activeStyleOutput?.rotateX || [20, -20],
//       Extrapolate.CLAMP
//     );
  
//     const rotateY = interpolate(
//       svX.value,
//       [0, layout.value.width],
//       activeStyleOutput?.rotateY || [-10, 10],
//       Extrapolate.CLAMP
//     );

//     const shadowOffset = {
//       width: interpolate(
//         svX.value,
//         [0, layout.value.width],
//         [10, -10]
//       ),
//       height: interpolate(
//         svY.value,
//         [0, layout.value.height],
//         [10, -10]
//       ),
//     }

//     const shadowOpacity = interpolate(
//       sharedValue.value,
//       [0, 1],
//       [0, 0.2]
//     )

//     return {
//       opacity: withTiming(opacity),
//       transform: [
//         {perspective: 1000},
//         {scale: withSpring(scale, springConfig)},
//         {rotateX: touching ? `${rotateX}deg` : withSpring("0deg")},
//         {rotateY: touching ? `${rotateY}deg` : withSpring("0deg")},
//       ],
//       elevation: withTiming(touching ? 5 : 0),
//       shadowOpacity: withTiming(shadowOpacity),
//       shadowOffset: {
//         width: withSpring(shadowOffset.width, springConfig),
//         height: withSpring(shadowOffset.height, springConfig),
//       },
//       shadowRadius: 10,
//     }
//   })

//   return (
//     <Animated.View
//       {..._props}
//       style={[
//         styles.container,
//         animatedStyle,
//         style
//       ]}
//       onLayout={captureLayout}
//     >
//       <Pressable  onPressIn={onPressIn} onPress={onPress} onPressOut={onPressOut}>
//         {props.children}
//       </Pressable>
//     </Animated.View>
//   )
// }

// interface ShyViewProps extends ViewProps {
//   children: React.ReactNode
//   activeStyleOutput?: {
//     scale?: [number, number]
//     opacity?: [number, number]
//     rotateX?: [number, number]
//     rotateY?: [number, number]
//   }
//   style?: StyleProp<ViewStyle>
//   onPress?: () => void
//   springConfig?: Animated.WithSpringConfig
// }

// const styles = StyleSheet.create({
//   container: {
//     margin: 20,
//     borderRadius: 20,
//     overflow: "hidden"
//   }
// })

// export default ShyView
