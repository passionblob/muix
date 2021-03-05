import React from 'react';
import {storiesOf} from '@storybook/react-native';
import { Text, View } from 'react-native';

storiesOf("Atoms/Abstract", module)
    .add(
        "Conditional",
        (...args) => {
            // console.log(args)
            return (
                <View>
                    <Text>작성해야 함</Text>
                </View>
            )
        },
        {
            component: View,
            args: {
                some: "string",
            }
        }
    )
