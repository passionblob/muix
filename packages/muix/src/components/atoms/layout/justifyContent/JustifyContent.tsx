import React, { Component } from 'react'
import { Text, View, ViewStyle } from 'react-native'

type JustifyContentProps = {
    value: ViewStyle["justifyContent"];
}

export class JustifyContent extends Component<JustifyContentProps> {
    render() {
        const {value, children} = this.props;
        return (
            <View style={{justifyContent: value}}>
                {children}
            </View>
        )
    }
}
