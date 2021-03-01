import React from 'react';
import {storiesOf} from '@storybook/react-native'
import {Button} from '@muix/muix-components';
import { Text } from 'react-native';

storiesOf("Test", module)
    .add("Button", () => (
        <Button>
            <Text>오우오우</Text>
        </Button>
    ))