import React, { Component } from 'react'
import { View } from 'react-native'

interface PaddingProps {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
    horizontal?: number | string;
    vertical?: number | string;
    value?: number | string;
}

export class Padding extends Component<PaddingProps> {
    render(): React.ReactNode {
        const { props } = this;
        return (
            <View style={{
                padding: props.value,
                paddingLeft: props.left,
                paddingRight: props.right,
                paddingTop: props.top,
                paddingBottom: props.bottom,
                paddingHorizontal: props.horizontal,
                paddingVertical: props.vertical,
            }}>
                {props.children}
            </View>
        )
    }
}

export default Padding
