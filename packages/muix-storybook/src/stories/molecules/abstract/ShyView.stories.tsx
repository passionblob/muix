import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ScrollView, View } from 'react-native';
import { ShyView } from "@monthem/muix";

const ShyViewStory = () => {
  return (
    <ScrollView>
      <ShyView style={{margin: 20}}>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
      <ShyView style={{margin: 20}}>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
      <ShyView style={{margin: 20}}>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
      <ShyView style={{margin: 20}}>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
      <ShyView style={{margin: 20}}>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
      <ShyView style={{margin: 20}}>
        <View style={{width: "100%", height: 300, backgroundColor: "blue"}} />
      </ShyView>
    </ScrollView>
  )
}

storiesOf("Molecules/Abstract", module)
  .add(
    "ShyView",
    () => <ShyViewStory/>,
  )
