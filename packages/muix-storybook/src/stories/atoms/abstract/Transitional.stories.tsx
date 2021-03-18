import {Transitional} from "@muix/muix-components"
import {storiesOf} from "@storybook/react-native"
import React from "react"
import { Animated } from "react-native"

const TransitionalStory = () => {
    return (
        <Transitional
            component={Animated.View}
            commonStyle={{
                width: 200,
                height: 200
            }}
            defaultStyle={{
                backgroundColor: "yellow"
            }}
            cases={[
                [true, {
                    backgroundColor: "black"
                }],
                [true, {
                    backgroundColor: "red"
                }]
            ]}
        />
    )
}

storiesOf("Atoms/Abstract", module)
    .add("Transitional", TransitionalStory)