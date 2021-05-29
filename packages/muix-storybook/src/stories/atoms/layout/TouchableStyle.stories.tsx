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
  return (
    <View>
      <TouchableStyle
        fallbackStyle={{
          width: 200,
          height: 200,
          backgroundColor: "blue",
          borderRadius: 0,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          elevation: 0,
          transform: [
            { perspective: 1000 },
            { rotateX: "0deg" },
            { rotateY: "0deg" },
            { scale: 1 }
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
            borderRadius: 40,
            elevation: 0,
            shadowOffset: {
              width: ratioX * -30,
              height: ratioY * -30,
            },
            transform: [
              { rotateX: `${ratioY * -30}deg` },
              { rotateY: `${ratioX * 30}deg` },
              { scale: 0.8 }
            ],
          }
        }}
      />
    </View>
  )
}