import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ScrollView, Text, View } from 'react-native';
import { SlideView } from '@monthem/muix/src';

storiesOf("Atoms/Layout", module)
  .add(
    "SlideView",
    () => <SlideViewStory />,
  )

const SlideViewStory = () => {
  return (
    <ScrollView>
      <View style={{height: 300, width: "100%"}}>
        <View
          style={{
            height: 50,
            width: 50,
            backgroundColor: "red",
            transform: [
              {translateX: 50},
              {translateY: 50}
            ],
            position: "absolute"
          }}
        />
        <View
          style={{
            height: 50,
            width: 50,
            backgroundColor: "red",
            transform: [
              {translateX: 100},
              {translateY: 150}
            ],
            position: "absolute"
          }}
        />
        <View
          style={{
            height: 50,
            width: 50,
            backgroundColor: "red",
            transform: [
              {translateX: 300},
              {translateY: 240}
            ],
            position: "absolute"
          }}
        />
        <SlideView
          snapPoints={[
            {translateX: 50, translateY: 50, inRadius: 300, outRadius: 10, key: "something"},
            {translateX: 100, translateY: 150, inRadius: 300, outRadius: 10, key: "further"},
            {translateX: 300, translateY: 240, inRadius: 300, outRadius: 10, key: "further more"},
          ]}
          onSlide={(translate) => {
            console.log(translate)
          }}
          onSnap={(point) => {
            console.log(point.key)
          }}
          style={{width: 50, height: 50, backgroundColor: "blue"}}
        />
      </View>
      <View style={{height: 300}}>
        <View
          style={{height: 100, backgroundColor: "purple", position: "absolute", width: "100%"}}
        />
        <SlideView
          snapPoints={[
            {translateX: -100, inRadius: 250, outRadius: 5},
            {translateX: 100, inRadius: 250, outRadius: 5},
          ]}
          onSlide={(spring) => {
            console.log(spring)
          }}
          disableVerticalSlide
          style={{height: 100, backgroundColor: "grey", position: "absolute", width: "100%"}}
        />
      </View>
    </ScrollView>
  )
}