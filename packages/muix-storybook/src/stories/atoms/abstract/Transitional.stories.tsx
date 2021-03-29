import {Transitional} from "@muix/muix-components"
import {storiesOf} from "@storybook/react-native"
import React from "react"
import { Animated, Text, TouchableOpacity, View } from "react-native"

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

            <Transitional
                component={Text}
                props={{}}
                commonStyle={{color: "black", fontWeight: "bold"}}
                defaultStyle={{color: "black", fontSize: 20}}
                cases={[
                    [conditions[0], {fontSize: 15}, {speed: 10}],
                    [conditions[1], {fontSize: 25}, {bounciness: 100}],
                    [conditions[2], {fontSize: 35}, {damping: 100}],
                    [conditions[3], {fontSize: 50}, {mass: 10}],
                ]}
            >
                텍스트 애니메이션
            </Transitional>

            <Transitional
                component={View}
                commonStyle={styles.common}
                defaultStyle={styles.default}
                cases={[
                    [conditions[0], styles.style1, {speed: 10}],
                    [conditions[1], styles.style2, {bounciness: 100}],
                    [conditions[2], styles.style3, {damping: 100}],
                    [conditions[3], styles.style4, {mass: 10}],
                ]}
            />
        </View>
    )
}

const styles = {
    common: {
        width: 200,
        height: 200,
    },
    default: {
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