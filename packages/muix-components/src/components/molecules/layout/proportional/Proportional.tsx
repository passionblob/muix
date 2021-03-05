import React, { Component } from 'react'
import { Text, View, ViewProps, ViewStyle } from 'react-native'
import cloneDeep from 'lodash.clonedeep'

type ViewElement = React.ComponentElement<ViewProps, View>;

interface ProportionalProps {
    children: ViewElement | ViewElement[]
    proportions: (number | undefined)[]
    direction?: "row" | "column"
    height?: number;
}

export class Proportional extends Component<ProportionalProps> {
    static defaultProps = {
        direction: "row"
    }

    render() {
        const {children, proportions, direction} = this.props;
        const mapped = React.Children.map(children, (childView: React.ComponentElement<ViewProps, View>, i) => {
            const newChildView = cloneDeep(childView);
            newChildView.props.style = {
                backgroundColor: "green",
                borderColor: "red",
                borderWidth: 1,
                flex: proportions[i]
            }
            return newChildView;
        })
        return (
            <View style={{flexDirection: direction}}>
                {mapped}
            </View>
        )
    }
}

export default Proportional
