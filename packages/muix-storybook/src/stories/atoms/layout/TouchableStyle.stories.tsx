import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import { TouchableStyle } from "@monthem/muix"

storiesOf("Atoms/Layout", module)
  .add(
    "TouchableStyle",
    () => <TouchableStyleStory />,
  )

const TouchableStyleStory = () => {
  const layout = React.useRef({
    height: 0,
    width: 0,
  })
  return (
    <View>
      <TouchableStyle
        fallbackStyle={{
          width: 200,
          height: 200,
          backgroundColor: "blue",
          transform: [
            { perspective: 1000 },
            { rotateX: "0deg" },
            { rotateY: "0deg" }
          ]
        }}
        styleOnTouch={(info) => {
          if (!info.e) return {}
          const { width, height } = info.layout
          const { locationX, locationY } = info.e.nativeEvent
          const ratioX = (locationX / width) * 2 - 1
          const ratioY = (locationY / height) * 2 - 1
          return {
            backgroundColor: "red",
            transform: [
              { rotateX: `${ratioY * -30}deg` },
              { rotateY: `${ratioX * 30}deg` },
            ],
          }
        }}
      />
    </View>
  )
}