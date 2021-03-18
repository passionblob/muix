import React from 'react';
import {storiesOf} from '@storybook/react-native';
import {Responsive} from '@muix/muix-components'
import { Text, View } from 'react-native';

storiesOf("Atoms/Abstract", module)
    .add(
        "Responsive",
        () => (
            <View>
                <Responsive
                    component={Text}
                    children={"이런이런"}
                    mxs={{style: {fontSize: 30}}}
                />
            </View>
        ),
    )
