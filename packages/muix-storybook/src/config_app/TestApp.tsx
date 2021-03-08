import React from "react"
import {Animated, Text, View} from "react-native"
import {Proportional} from "@muix/muix-components"

const App = () => {
    const anim = new Animated.Value(0)
    const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    })

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(anim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start()
    }, [])

    return (
        <Animated.View style={{transform: [{scale}]}}>
            <View>
                <View>
                    <Text>1: 2</Text>
                    <Proportional proportions={[1, 2]}>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                    </Proportional>
                </View>
                <View>
                    <Text>undefined: 2: 1</Text>
                    <Proportional proportions={[undefined, 2, 1]}>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                    </Proportional>
                </View>
                <View>
                    <Text>undefined: undefined: 1</Text>
                    <Proportional proportions={[undefined, undefined, 1]}>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                    </Proportional>
                </View>
                <View>
                    <Text>undefined: 2: 1: undefined</Text>
                    <Proportional proportions={[undefined, 2, 1, undefined]}>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                    </Proportional>
                </View>
                <View>
                    <Text>undefined: 2: undefined: 1</Text>
                    <Proportional proportions={[undefined, 2, undefined, 1]}>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                    </Proportional>
                </View>
                <View>
                    <Text>undefined: 1</Text>
                    <Proportional proportions={[undefined, 1]}>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                        <View>
                            <Text>되냐?</Text>
                        </View>
                    </Proportional>
                </View>
            </View>
        </Animated.View>
    )
}

export default App