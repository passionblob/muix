import React, { Component } from 'react'
import { View, ViewStyle } from 'react-native'

type BoxProps = ViewStyle & {
    children?: React.ReactChildren
}
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
