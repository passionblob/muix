import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ScrollView, Text, View } from 'react-native';
import { DraggableView } from '@monthem/muix';
import { useSpring, animated } from "react-spring/native"

storiesOf("Atoms/Layout", module)
  .add(
    "DraggableView",
    () => <DraggableViewStory />,
  )

const DraggableViewStory = () => {
  const [spring, setSpring] = useSpring(() => {
    return {
      ballLScale: 1,
      ballRScale: 1,
    }
  })

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
        <DraggableView
          snapPoints={[
            {translateX: 50, translateY: 50, radius: 50, key: "something"},
            {translateX: 100, translateY: 150, radius: 50, key: "further"},
            {translateX: 300, translateY: 240, radius: 50, key: "further more"},
          ]}
          onSnap={(point) => {
            console.log(point.key)
          }}
          style={{width: 50, height: 50, backgroundColor: "blue"}}
        />
      </View>
      <View style={{height: 300}}>
        <View style={{
          height: 100,
          backgroundColor: "purple",
          position: "absolute",
          width: "100%",
          flexDirection: "row"
        }}>
          <View style={{height: "100%", justifyContent: "center", flex: 1, paddingLeft: 20}}>
            <animated.View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "white",
              opacity: spring.ballLScale,
              transform: [{scale: spring.ballLScale}]}}
            />
          </View>
          <View style={{height: "100%", justifyContent: "center", flex: 1, alignItems: "flex-end", paddingRight: 20}}>
            <animated.View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "white",
              opacity: spring.ballRScale,
              transform: [{scale: spring.ballRScale}]}}
            />
          </View>
        </View>
        <DraggableView
          snapPoints={[
            {translateX: -100, radius: 10},
            {translateX: 100, radius: 10},
          ]}
          onSlide={({x, y}) => {
            const target = x > 0 ? "ballLScale" : "ballRScale"
            const other = x > 0 ? "ballRScale" : "ballLScale"
            const progress = Math.abs(x / 100) || 1
            setSpring.set({
              [other]: 0
            })
            setSpring.start({
              [target]: Math.log10(progress * 10),
            })
          }}
          onSnap={({translateX: x}) => {
            const target = x > 0 ? "ballLScale" : "ballRScale"
            setSpring.start({
              [target]: 1,
            })
          }}
          disableVerticalSlide
          style={{height: 100, backgroundColor: "grey", position: "absolute", width: "100%"}}
        />
      </View>
    </ScrollView>
  )
}