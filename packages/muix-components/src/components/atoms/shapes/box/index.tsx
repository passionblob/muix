import React, { Component } from 'react'
import { View, ViewStyle } from 'react-native'

export interface BoxProps extends ViewStyle {}

export class Box extends Component<BoxProps> {
    render(): React.ReactNode {
        return (
            <View
                style={this.props}
                children={this.props.children}
            />
        )
    }
}

export default Box
