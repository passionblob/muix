import React, { Component } from 'react'
import { View } from 'react-native'

export class FlexHorizontal extends Component {
    render(): React.ReactNode {
        return (
            <View style={{flexDirection: "row"}}>
                {this.props.children}
            </View>
        )
    }
}

export default FlexHorizontal
