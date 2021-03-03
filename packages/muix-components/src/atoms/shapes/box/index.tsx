import React, { Component } from 'react'
import { View, ViewStyle } from 'react-native'

type BoxProps = ViewStyle

export class Box extends Component<BoxProps> {
    render(): React.ReactNode {
        return (
            <View style={this.props} />
        )
    }
}

export default Box
