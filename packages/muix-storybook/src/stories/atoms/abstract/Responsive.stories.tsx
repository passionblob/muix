import React from 'react';
import {storiesOf} from '@storybook/react-native';
import {Responsive} from "@muix/muix-components"
import { Text, TextProps, View } from 'react-native';
import { defineBreakpoints } from '../../../lib/responsive';

storiesOf("Atoms/Abstract", module)
    .add(
        "Responsive",
        () => (
            <View>
                <Responsive
                    component={Text}
                    children={"이런이런"}
                    breakpoints={defineBreakpoints<TextProps>({
                        "320px": {style: {fontSize: 16}},
                        "720px": {style: {fontSize: 20}}
                    })}
                />
            </View>
        ),
    )
