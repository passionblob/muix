import React from 'react';
import {storiesOf} from '@storybook/react-native';
import { Text, View } from 'react-native';
import { Grid, Responsive } from '@muix/muix-components';
import chroma from 'chroma-js';

storiesOf("Atoms/Layout", module)
    .add(
        "Grid",
        () => (
            <Grid
                rowHeight={100}
                marginBetweenHorizontal={5}
                marginBetweenVertical={5}
                columnCount={4}
            >
                {Array(10).fill(0).map((_, i) => (
                    <View key={i} style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: chroma.random().hex(),
                        borderRadius: 5,
                    }} />
                ))}
            </Grid>
        ),
    )
