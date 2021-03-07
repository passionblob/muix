import React, { Component } from 'react'
import {StoryContext, StoryContextValue} from "./StoryContext"

export class StoryProvider extends Component<{}, StoryContextValue> {
    constructor(props: Readonly<{}>) {
        super(props)
        this.state = {
            selected: "",
            selectStory: this.selectStory,
        }
    }

    render() {
        const {props, state} = this;
        return (
            <StoryContext.Provider value={state}>
                {props.children}
            </StoryContext.Provider>
        )
    }

    selectStory = (id: string) => {
        this.setState({
            selected: id
        })
    }
}

export default StoryProvider
