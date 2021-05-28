import React from 'react';
import {storiesOf} from '@storybook/react-native';
import {StoryFn} from "@storybook/addons"
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Conditional } from '@monthem/muix';
import Styled from "styled-components"
import chroma from 'chroma-js';
import { withKnobs, object, boolean } from "@storybook/addon-knobs"

const Dummy = Styled(View)`
    width: 200px;
    height: 100px;
    background-color: ${chroma.random().hex()};
`;

const ConditionalStory = () => {
    return (
        <View>
            <Conditional
                shouldRender={true}
                component={TouchableOpacity}
                defaultProps={{
                    style: {backgroundColor: "red"}
                }}
                commonProps={{
                    onPress: () => {}
                }}
                cases={[
                    [boolean("first condition", true), {
                        style: {
                            backgroundColor: "blue",
                            width: 300,
                            height: 100,
                        }
                    }],
                    [boolean("second condition", true), {
                        style: {
                            backgroundColor: "green",
                            width: 200,
                            height: 200,
                        }
                    }],
                    [boolean("third condition", true), {
                        style: {
                            backgroundColor: "yellow",
                            width: 100,
                            height: 300,
                        }
                    }],
                ]}
            />
        </View>
    )
}

storiesOf("Atoms/Abstract", module)
    .addDecorator(withKnobs)
    .add("Conditional", () => <ConditionalStory/>)
