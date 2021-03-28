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
                    borderColor: "black",
                    backgroundColor: "yellow",
                    borderWidth: 0,
                }}
                cases={[
                    [conditions[0], {
                        backgroundColor: "dodgerblue",
                        width: 100,
                        height: 400,
                        borderWidth: 10,
                        borderColor: "blue"
                    }],
                    [conditions[1], {
                        backgroundColor: "red",
                        width: 200,
                        height: 300,
                        borderColor: "green",
                    }],
                    [conditions[2], {
                        backgroundColor: "blue",
                        width: 300,
                        height: 200,
                        borderWidth: 30,
                        borderColor: "skyblue",
                        borderRadius: 100,
                    }],
                    [conditions[3], {
                        backgroundColor: "green",
                        width: 400,
                        height: 100,
                        borderWidth: 40,
                        borderColor: "red",
                        opacity: 0.5,
                    }],
                ]}
            />
        </View>
    )
}

storiesOf("Atoms/Abstract", module)
    .add("Transitional", TransitionalStory)