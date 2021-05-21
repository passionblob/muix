import React from 'react'
import { View, Text, ViewProps, PanResponder } from 'react-native'
import { animated, useSpring } from "react-spring/native"
import Carousel from "react-native-snap-carousel"

const choices = [
  "나는 상상력이 풍부하고 낭만적인 편이다",
  "나는 현실적이고 실용적인 편이다"
]

export const ChoiceSlider = (props: ChoiceSliderProps) => {
  const [index, setIndex] = React.useState(0);
  const touchID = React.useRef("-1");
  const touchStart = React.useRef({x: 0, y: 0}).current;
  const [spring, setSpring] = useSpring(() => ({
    virtualTranslate: 0
  }))

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderStart: (e) => {
      if (touchID.current !== "-1") return;
      const { pageX, pageY, identifier } = e.nativeEvent;
      touchID.current = identifier;
      touchStart.x = pageX;
      touchStart.y = pageY;
    },
    onPanResponderMove: (e) => {
      const { pageX, locationY, identifier } = e.nativeEvent;
      if (touchID.current !== identifier) return;
    },
    onPanResponderEnd: (e) => {
      const { pageX, pageY, identifier } = e.nativeEvent;
      if (touchID.current !== identifier) return;
      touchID.current = "-1";
    }
  })

  return (
    <View {...props}>
      <animated.View {...panResponder.panHandlers}>
        <Text style={{color: "white", fontSize: 30}}>
          {choices[index]}
        </Text>
      </animated.View>
    </View>
  )
}

interface ChoiceSliderProps extends ViewProps {

}