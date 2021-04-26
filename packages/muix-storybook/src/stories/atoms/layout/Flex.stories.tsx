import React from 'react';
import {storiesOf} from '@storybook/react-native';
import { Text, View } from 'react-native';

storiesOf("Atoms/Layout", module)
    .add(
        "Flex",
        () => (
            <View>
                <Text>작성해야 함</Text>
            </View>
        ),
    )
