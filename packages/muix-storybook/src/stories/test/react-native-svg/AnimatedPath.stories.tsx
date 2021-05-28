import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View, Text, Animated } from 'react-native';
import { Svg, Path, G } from "react-native-svg"
import svgpath from "svgpath"
import * as polymorph from "polymorph-js"
import { useSpring } from '@react-spring/core';
import { syncAnimatedToSpring, TouchableStyle, useSpringToggle } from '@monthem/muix/src';

const chatBubble = `M474.6,139.9V284c0,60.3-48.9,109.1-109.1,109.1H252.9L145.5,500.5V393.1C86.4,391.8,38.9,343.5,38.9,284V139.9
C38.9,79.7,87.7,30.8,148,30.8h217.5C425.8,30.8,474.6,79.7,474.6,139.9z`
const heart = `M448,310.7L258.8,485.9L69.6,310.7c0,0-61.6-62.3-41.1-166.3C49,40.3,157.2,56.8,174.3,60.9c17.1,4.1,60.9,34.2,84.5,65
c23.6-30.8,67.4-60.9,84.5-65c17.1-4.1,125.2-20.5,145.8,83.5C509.6,248.4,448,310.7,448,310.7z`

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

svgpath(heart).iterate((segment, index, x, y) => {
  if (x > maxX) maxX = x
  if (y > maxY) maxY = y
  if (x < minX) minX = x
  if (y < minY) minY = y
})

const width = maxX - minX
const height = maxY - minY
const offset = 20

const interpolator = polymorph.interpolate([chatBubble, heart])

const AnimatedPath = Animated.createAnimatedComponent(Path)

const AnimatedPathStory = () => {
  const anim = React.useRef(new Animated.Value(0)).current
  const [progress, toggle] = useSpringToggle({
    config: {tension: 1000}
  })

  syncAnimatedToSpring({ spring: progress, anim })

  const d = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      interpolator(0.001),
      interpolator(0.999)
    ]
  })

  return (
    <View>
      <TouchableStyle
        springConfig={{tension: 10000, bounce: 0}}
        onPress={toggle}
        fallbackStyle={{
          opacity: 1,
          width: 130,
          transform: [
            { scale: 1 }
          ]
        }}
        styleOnTouch={{
          opacity: 0.7,
          transform: [
            { scale: 1.05 }
          ]
        }}
      >
        <Svg
          viewBox={`${minX} ${minY - 50} ${width + 50} ${height + 100}`}
          width={130}
          height={120}
        >
          <G x={-offset}>
            <AnimatedPath fill={"fuchsia"} d={d} />
          </G>
          <G x={offset}>
            <AnimatedPath fill={"aquamarine"} d={d} />
          </G>
          <G>
            <AnimatedPath d={d} />
          </G>
        </Svg>
      </TouchableStyle>
    </View>
  )
}

storiesOf("Test/React Native Svg", module)
  .add("AnimatedPath", () => <AnimatedPathStory />)
