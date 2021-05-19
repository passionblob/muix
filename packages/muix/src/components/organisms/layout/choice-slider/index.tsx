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
  const [spring, setSpring] = useSpring(() => {
    return {
      
    }
  })
  const touchID = React.useRef("-1");
  const touchStart = React.useRef({x: 0, y: 0}).current;
  const touchCurrent = React.useRef({x: 0, y: 0}).current;
  const touchEnd = React.useRef({x: 0, y: 0}).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderStart: (e) => {
      if (touchID.current !== "-1") return;
      const { locationX, locationY, identifier } = e.nativeEvent;
      touchID.current = identifier;
      touchStart.x = locationX;
      touchStart.y = locationY;
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY, identifier } = e.nativeEvent;
      if (touchID.current !== identifier) return;
      touchCurrent.x = locationX;
      touchCurrent.y = locationY;
    },
    onPanResponderEnd: (e) => {
      const { locationX, locationY, identifier } = e.nativeEvent;
      if (touchID.current !== identifier) return;
      touchID.current = "-1";
      touchEnd.x = locationX;
      touchEnd.y = locationY;
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