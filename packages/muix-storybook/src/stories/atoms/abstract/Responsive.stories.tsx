import React from 'react';
import {storiesOf} from '@storybook/react-native';
import {Responsive} from '@muix/muix-components'
import { Text, View } from 'react-native';
import {withKnobs} from "@storybook/addon-knobs"

storiesOf("Atoms/Abstract", module)
    .addDecorator(withKnobs)
    .add(
        "Responsive",
        () => (
            <View>
                <Responsive
                    component={Text}
                    children={"이런이런"}
                    xs={{style: {fontSize: 30}}}
                />
            </View>
        ),
    )
