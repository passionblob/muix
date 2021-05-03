import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, View } from 'react-native';
import { ShyView } from "@monthem/muix"

storiesOf("Molecules/Abstract", module)
  .add(
    "ShyView",
    () => <ShyViewStory/>,
  )

const ShyViewStory = () => {
  return (
    <View>
      <ShyView>
        <View style={{height: 300, backgroundColor: "blue"}} />
      </ShyView>
    </View>
  )
}