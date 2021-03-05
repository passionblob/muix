import React, { Component } from 'react'
import { View, ViewStyle } from 'react-native'
import chroma from 'chroma-js'
import deepmerge from 'deepmerge'

interface BadgeProps {
    padding?: number
    color?: string
    border?: "none" | string
    borderColor?: string
    verticalAlign?: "top" | "center" | "bottom" | "stretch"
}

export class Badge extends Component<BadgeProps> {
    static defaultProps: Required<Pick<BadgeProps, "color" | "padding">> = {
        color: "aliceblue",
        padding: 5,
    }

    render() {
        const safeProps = deepmerge(Badge.defaultProps, this.props);
        const {padding, color} = safeProps;
        const {children, verticalAlign, borderColor, border} = this.props;

        let alignItems: ViewStyle["alignItems"] = "flex-end"

        if (verticalAlign === "bottom") alignItems = "flex-end";
        if (verticalAlign === "center") alignItems = "center";
        if (verticalAlign === "top") alignItems = "flex-start";
        if (verticalAlign === "stretch") alignItems = "stretch";

        const style: ViewStyle = {
            backgroundColor: color,
            padding,
            paddingLeft: padding * 2,
            paddingRight: padding * 2,
            borderColor: borderColor || chroma(color as string).darken().hex(),
            borderWidth: border === "none" ? 0 : 1,
            borderRadius: 10,
            justifyContent: verticalAlign === "stretch" ? "center" : "flex-start"
        }

        return (
            <View style={{flexDirection: "row", alignItems}}>
                <View style={style}>
                    {children}
                </View>
            </View>
        )
    }
}

export default Badge
