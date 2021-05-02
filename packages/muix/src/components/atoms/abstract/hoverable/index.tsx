import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { HoverableProps } from "./types"

export class Hoverable extends Component<HoverableProps> {
  render() {
    return (
      <View>
        <Text> textInComponent </Text>
      </View>
    )
  }
}

export default Hoverable
