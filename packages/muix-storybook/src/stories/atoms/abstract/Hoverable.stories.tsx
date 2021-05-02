import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, View } from 'react-native';
import { Hoverable } from "@monthem/muix"

storiesOf("Atoms/Abstract", module)
  .add(
    "Hoverable",
    () => (
      <View>
        <Hoverable style={{backgroundColor: "blue"}}>
          <Text>작성해야 함</Text>
        </Hoverable>
      </View>
    ),
  )
