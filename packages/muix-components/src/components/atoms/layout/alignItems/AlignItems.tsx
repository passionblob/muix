import React, { Component } from 'react'
import { Text, View, ViewStyle } from 'react-native'

type AlignItemsProps = {
    value: ViewStyle["alignItems"]
}

export class AlignItems extends Component<AlignItemsProps> {
    render() {
        const {value, children} = this.props;
        return (
            <View style={{alignItems: value}}>
                {children}
            </View>
        )
    }
}

export default AlignItems
