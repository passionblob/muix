// import React from 'react'
// import {
//   View,
//   LayoutChangeEvent
// } from 'react-native'
// import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
// import { CollapsibleProps, CollapsibleState } from './types'

// /**
//  * Implemented with Reanimated API.
//  * Advantage: Performance
//  * Disadvantage: Maybe low compatibility.
//  */
// let count = 0
// export const ReanimatedCollapsible: React.FC<Omit<CollapsibleProps, "engine">> = (props) => {
//   const {children, header, style} = props
//   const [] = React.useState(0)
//   const contentContainerHeight = useSharedValue(0)
//   const $container = React.useRef<View>(null)

//   const [state, setState] = React.useState<CollapsibleState>({
//     collapsed: (() => {
//       if (props.initialState === "collapsed") return true
//       if (props.initialState === "open") return false
//       if (props.collapsed !== undefined) return props.collapsed
//       return true
//     })(),
//     capturedLayout: undefined,
//   })

//   const collapsed = props.collapsed === undefined
//     ? state.collapsed
//     : props.collapsed

//   const toggleCollapsed = () => {
//     if (props.collapsed !== undefined) return;
//     setState({
//       collapsed: !!!collapsed
//     })
//   }

//   const onLayout = (e: LayoutChangeEvent) => {
//     const {layout} = e.nativeEvent
//     if (layout.height !== 0) {
//       setState({...state, capturedLayout: layout})
//     }
//   }

//   const contentContainerStyle = useAnimatedStyle(() => {
//     return {
//       height: state.capturedLayout === undefined
//         ? undefined
//         : withTiming(contentContainerHeight.value)
//     }
//   })

//   React.useEffect(() => {
//     console.log(count ++)
//     if (collapsed) {
//       contentContainerHeight.value = 0
//     } else if (state.capturedLayout) {
//       contentContainerHeight.value = state.capturedLayout.height
//     }
//   })

//   return (
//     <View style={style}>
//       {React.createElement(header, {
//         collapsed,
//         toggleCollapsed
//       })}
//       <Animated.View style={[{overflow: "hidden"}, contentContainerStyle]}>
//         <View onLayout={onLayout} ref={$container}>
//           {children}
//         </View>
//       </Animated.View>
//     </View>
//   )
// } 

// export default ReanimatedCollapsible
