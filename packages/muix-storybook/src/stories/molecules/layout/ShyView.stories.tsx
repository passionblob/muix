import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, View } from 'react-native';
import { ShyView } from '@monthem/muix/src';

const ShyViewStory = () => {
  return (
    <ShyView style={{width: 300, height: 200, backgroundColor: "blue"}}>
    </ShyView>
  )
}

storiesOf("Molecules/Layout", module)
  .add(
    "ShyView", () => <ShyViewStory />
  )
