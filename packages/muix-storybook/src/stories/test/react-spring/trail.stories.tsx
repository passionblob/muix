import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { StoryFn } from "@storybook/addons"
import { View, Text, TouchableWithoutFeedback, Pressable, PressableProps } from 'react-native';
import { useTrail } from '@react-spring/core';
import { animated } from '@react-spring/native';
import WebColors from '@monthem/web-color';
import styled from "styled-components";

const SampleText = styled(Text)`
  font-size: 40px;
  font-weight: bold;
  color: ${WebColors.FloralWhite};
`

const TrailContailer: React.FC<PressableProps> = styled(Pressable)`
  background-color: ${WebColors.Aquamarine};
  padding: 10px;
`;

const Trail: React.FC<{visible: boolean}> = (props) => {
  const children = React.Children.toArray(props.children)

  const trailStyle = {
    opacity: props.visible ? 1 : 0,
    translateX: props.visible ? 0 : 30,
    translateY: props.visible ? 0 : -30,
  }

  const [trail, trailApi] = useTrail(children.length, () => {
    return trailStyle
  })

  React.useEffect(() => {
    trailApi.start(trailStyle)
  })
  
  return (
    <View>
      {trail.map((spring, i) => (
        <animated.View
          key={i}
          style={{
            opacity: spring.opacity,
            transform: [
              {translateX: spring.translateX},
              {translateY: spring.translateY}
            ]
          }}
        >
          {children[i]}
        </animated.View>
      ))}      
    </View>
  )
}

const TrailStory = () => {
  const [visible, setVisibility] = React.useState(true)

  const onPress = () => {
    setVisibility(!visible)
  }

	return (
		<TrailContailer onPress={onPress}>
			<Trail visible={visible}>
        <SampleText>This</SampleText>
        <SampleText>is a</SampleText>
        <SampleText>trail effect</SampleText>
      </Trail>
		</TrailContailer>
	)
}

storiesOf("Test/React Spring", module)
	.add("Trail", () => <TrailStory/>)
