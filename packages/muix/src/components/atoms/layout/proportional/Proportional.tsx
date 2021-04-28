import React, { Component } from 'react'
import { View, ViewProps, ViewStyle } from 'react-native'

type ViewElement = React.ComponentElement<ViewProps, View>;
export interface ProportionalProps {
    children: ViewElement | ViewElement[]
    proportions: (number | undefined)[]
    style?: ViewStyle
}

export class Proportional extends Component<ProportionalProps> {
    render() {
        const {children, proportions, style} = this.props;

        const overrideChildView = (childView: ViewElement, i: number) => {
            return React.cloneElement(childView, {
                style: [childView.props.style, {flex: proportions[i]}]
            });
        }

        const mapped = React.Children.map(children, overrideChildView)

        return (
            <View style={style}>
                {mapped}
            </View>
        )
    }
}

export default Proportional
