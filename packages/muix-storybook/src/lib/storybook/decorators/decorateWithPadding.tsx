import {makeDecorator} from "@storybook/addons"
import React from "react"
import { View } from "react-native"

export const decorrateWithPadding = makeDecorator({
    name: "PaddingDecorator",
    parameterName: "none",
    wrapper: (getStory, c) => {
        return (
            <View style={{padding: 20}}>
                {getStory(c)}
            </View>
        )
    }
})