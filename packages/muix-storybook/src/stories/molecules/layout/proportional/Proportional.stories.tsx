import React from 'react';
import {storiesOf} from '@storybook/react-native';
import { Text, View } from 'react-native';
import {Proportional} from '@muix/muix-components'

storiesOf("Molecules/Layout", module)
    .add(
        "Proportional",
        () => (
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
        ),
    )
