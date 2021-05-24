import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, View } from 'react-native';
import { TouchableStyle2 } from "@monthem/muix"

const TouchableStyleStory = () => {
  return (
    <TouchableStyle2
      style={{width: 200, height: 200, backgroundColor: "blue"}}
    />
  )
}

storiesOf("Atoms/Layout", module)
  .add("TouchableStyle(spring)", () => <TouchableStyleStory/>)
