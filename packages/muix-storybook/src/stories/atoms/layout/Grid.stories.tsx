import React from 'react';
import {storiesOf} from '@storybook/react-native';
import { Text, View } from 'react-native';
import { Responsive, GridBase } from "@muix/muix-components";
import chroma from 'chroma-js';

storiesOf("Atoms/Layout", module)
    .add(
        "GridBase",
        () => (
            <View>
                <Responsive
                    component={GridBase}
                    msm={{column: 4}}
                    lg={{column: 6}}
                    children={Array(10).fill(0).map((_, i) => (
                        <View key={i} style={{
                            width: "100%",
                            height: 40,
                            backgroundColor: chroma.random().hex(),
                            borderRadius: 5,
                        }} />
                    ))}
                />
            </View>
        ),
    )
