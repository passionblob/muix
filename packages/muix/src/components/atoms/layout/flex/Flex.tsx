import React, { Component } from 'react'
import { Text, View, ViewStyle } from 'react-native'

type FlexProps = {
    value?: ViewStyle["flex"];
    direction?: ViewStyle["flexDirection"];
    basis?: ViewStyle["flexBasis"];
    shrink?: ViewStyle["flexShrink"];
    grow?: ViewStyle["flexGrow"];
    wrap?: ViewStyle["flexWrap"];
}

export class Flex extends Component<FlexProps> {
    render() {
        const {children, ...flexStyle} = this.props;
        return (
            <View style={{
                flexWrap: flexStyle.wrap,
                flexGrow: flexStyle.grow,
                flexShrink: flexStyle.shrink,
                flexBasis: flexStyle.basis,
                flexDirection: flexStyle.direction,
                flex: flexStyle.value,
            }}>
                {children}
            </View>
        )
    }
}
