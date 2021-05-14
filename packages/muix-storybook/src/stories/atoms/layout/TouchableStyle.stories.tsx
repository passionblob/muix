import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { LayoutRectangle, ScrollView, View } from 'react-native';
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
        onLayout={(e) => layout.current = e.nativeEvent.layout}
        style={{
          width: 200,
          height: 200,
          backgroundColor: "red",
          opacity: 1,
          shadowOffset: {
            height: 0,
            width: 0
          }
        }}
        styleOnTouch={(e) => {
          const {locationX, locationY} = e.nativeEvent
          const relativeX = locationX / layout.current.width
          const relativeY = locationY / layout.current.height
          return {
            width: 200,
            height: 200,
            backgroundColor: "blue",
            opacity: 0.5,
            transform: [
              {scale: 0.95},
              {rotateY: `${(relativeX * 2 - 1) * 30}deg`},
              {rotateX: `${(relativeY * 2 - 1) * -30}deg`}
            ],
            shadowOffset: {
              width: (relativeY * 2 - 1) * -10,
              height: (relativeX * 2 - 1) * 10
            },
            shadowRadius: 20,
            shadowOpacity: 0.5,
          }
        }}
      >
      </TouchableStyle>
    </View>
  )
}