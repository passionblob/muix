import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { Story } from './shared'

export class CustomStoryView extends Component<CustomStoryViewProps> {
    render() {
        const {story} = this.props
        if (story === undefined) return null        
        return story.render()
    }
}

interface CustomStoryViewProps {
    story?: Story
}

export default CustomStoryView
