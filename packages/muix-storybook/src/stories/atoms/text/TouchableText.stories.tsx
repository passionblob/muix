import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import { TouchableText } from "@monthem/muix"

storiesOf("Atoms/Text", module)
  .add(
    "TouchableText",
    () => <TouchableTextStory />,
  )

const TouchableTextStory = () => {
  return (
    <View>
      <TouchableText
        fallbackStyle={{fontSize: 30}}
        styleOnTouch={{fontSize: 50}}
        children={"테스트 텍스트"}
      />
    </View>
  )
}