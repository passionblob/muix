import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, View } from 'react-native';
// import { ShyView } from "@monthem/muix";
import ShyView from "./ContentIntroducer"

const ShyViewStory = () => {
  return (
    <View>
      <ShyView>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
    </View>
  )
}

storiesOf("Molecules/Abstract", module)
  .add(
    "ShyView",
    () => <ShyViewStory/>,
  )
