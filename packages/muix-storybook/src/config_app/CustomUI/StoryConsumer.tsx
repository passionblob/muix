import { Identity, Props, SupportedComponent } from '@muix/muix-components/src';
import React, { Component } from 'react'
import { View } from 'react-native';
import {StoryContext, StoryContextValue} from "./StoryContext"

export class StoryConsumer<C extends SupportedComponent> extends Component<StoryConsumerProps<C>> {
    static contextType = StoryContext

    render() {
        return (
            <StoryContext.Consumer>
                {(context) => this.renderByContext(context)}
            </StoryContext.Consumer>
        )
    }

    renderByContext = (context?: StoryContextValue) => {
        const {props} = this;
        if (context === undefined) return null
        return (
            <Identity
                component={props.component}
                props={props.props(context)}
            />
        )
    }
}

interface StoryConsumerProps<C extends SupportedComponent> {
    component: C
    props: (context: StoryContextValue) => Props<C>
}

export default StoryConsumer
