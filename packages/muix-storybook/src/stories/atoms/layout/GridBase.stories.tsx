import React from 'react';
import {storiesOf} from '@storybook/react-native';
import { Text, View } from 'react-native';
import { Responsive, GridBase, GridBaseProps } from "@monthem/muix";
import chroma from 'chroma-js';
import { defineBreakpoints } from '../../../lib/responsive';

storiesOf("Atoms/Layout", module)
    .add(
        "GridBase",
        () => (
            <View>
                <Responsive
                    component={GridBase}
                    breakpoints={defineBreakpoints<GridBaseProps<any>>({
                        "320px": {column: 3},
                        "720px": {column: 4},
                    })}
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
