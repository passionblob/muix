import {Transitional} from "@muix/muix-components"
import {storiesOf} from "@storybook/react-native"
import React from "react"
import { Animated, Text, TouchableOpacity, View } from "react-native"

const TransitionalStory = () => {
    const [conditions, setConditions] = React.useState([false, false, false, false]);
    const toggleCondition = (index: number) => {
        const toggled = Array(conditions.length).fill(false);
        toggled[index] = true
        setConditions(toggled)
    }

    return (
        <View style={{height: 400}}>
            <View>
                {conditions.map((toggled, i) => (
                    <TouchableOpacity key={i} onPress={() => toggleCondition(i)}>
                        <Text style={{padding: 10, borderWidth: 1, backgroundColor: toggled ? "green" : "grey"}}>{i}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Transitional
                component={Animated.View}
                commonStyle={{
                    width: 200,
                    height: 200,
                }}
                defaultStyle={{
                    backgroundColor: "yellow",
                    margin: 100
                }}
                cases={[
                    [conditions[0], {
                        backgroundColor: "black",
                        width: 100,
                        height: 400,
                        margin: 10,
                    }],
                    [conditions[1], {
                        backgroundColor: "red",
                        width: 200,
                        height: 300,
                        margin: 20,
                    }],
                    [conditions[2], {
                        backgroundColor: "blue",
                        width: 300,
                        height: 200,
                        margin: 30,
                    }],
                    [conditions[3], {
                        backgroundColor: "green",
                        width: 400,
                        height: 100,
                        margin: 40
                    }],
                ]}
            />
        </View>
    )
}

storiesOf("Atoms/Abstract", module)
    .add("Transitional", TransitionalStory)