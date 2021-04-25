import {Transitional} from "@muix/muix-components"
import {storiesOf} from "@storybook/react-native"
import React from "react"
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native"

const TransitionalStory = () => {
    const [conditions, setConditions] = React.useState([false, false, false, false]);
    const toggleCondition = (index: number) => {
        const toggled = Array(conditions.length).fill(false);
        toggled[index] = !conditions[index]
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

            <Transitional.View
                style={[styles.common, styles[`style${conditions.findIndex((val) => !!val)}`]]}
            >
                <Transitional.Text/>
            </Transitional.View>
        </View>
    )
}

const styles = {
    common: {
        width: 200,
        height: 200,
    },
    style0: {
        borderColor: "black",
        backgroundColor: "yellow",
        borderWidth: 10,
        width: 100,
        height: 100,
    },
    style1: {
        backgroundColor: "dodgerblue",
        width: 100,
        height: 400,
        borderWidth: 10,
        borderColor: "blue",
        transform: [
            {translateX: 100},
        ]
    },
    style2: {
        backgroundColor: "red",
        width: 200,
        height: 300,
        borderColor: "green",
        transform: [
            {translateX: 200},
            {translateY: 100},
        ]
    },
    style3: {
        backgroundColor: "blue",
        width: 300,
        height: 200,
        borderWidth: 30,
        borderColor: "skyblue",
        borderRadius: 100,
        transform: [{skewX: "0.5rad"}, {scale: 1.2}]
    },
    style4: {
        backgroundColor: "green",
        width: 400,
        height: 100,
        borderWidth: 40,
        borderColor: "red",
        opacity: 0.5,
    }
}

storiesOf("Atoms/Abstract", module)
    .add("Transitional", TransitionalStory)