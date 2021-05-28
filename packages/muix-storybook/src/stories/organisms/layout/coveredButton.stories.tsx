import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { CoveredButton } from '@monthem/muix';

const CoveredButtonStory = () => {
  return (
    <View>
      <CoveredButton
        coverContent={(progress) => {
          return (
            <View style={{flex: 1, backgroundColor: "red"}}>
              <View style={{position: "absolute", top: -10, backgroundColor: "blue", width: 10, height: 10}} />
            </View>
          )
        }}
        onToggle={(toggled) => {
          console.log(toggled)
        }}
        title={"에니어그램"}
        subTitle={"나의 내면 발견하기"}
        buttonText={"자세히 보기"}
        style={{ height: 125, width: 120 }}
      />
    </View>
  )
}

storiesOf("Organisms/Layout", module)
  .add("CoveredButton", () => <CoveredButtonStory />)
