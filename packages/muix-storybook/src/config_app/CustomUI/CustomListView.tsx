import { Responsive } from '@muix/muix-components/src'
import { getStorybook } from '@storybook/react-native'
import React, { Component } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getStoryId, Story, Section } from './shared'
import StoryConsumer from './StoryConsumer'
import { storybookLayout } from "./shared"

export class CustomListView extends Component<CustomListViewProps> {
    private storybook: ReturnType<typeof getStorybook>
    constructor(props: Readonly<CustomListViewProps>) {
        super(props)
        this.storybook = props.storybook
    }

    render() {
        return (
            <Responsive
                component={View}
                commonProps={{style: styles.listView}}
                xs={{style: {width: storybookLayout.xs.listViewWidth}}}
                sm={{style: {width: storybookLayout.sm.listViewWidth}}}
                children={(
                    <SafeAreaView>
                        {this.storybook.map((section) => (
                            <StorySection
                                key={section.kind}
                                section={section}
                            />
                        ))}
                    </SafeAreaView>
                )}
            />
        )
    }
}

const StorySection = (props: StorySectionProps) => {
    const {section} = props

    const SectionsItems = section.stories.map((story) => {
        const id = getStoryId(section, story);
        return (
            <StoryConsumer
                key={id}
                component={StorySectionItem}
                props={(context) => ({
                    id,
                    story,
                    selected: id === context.selected,
                    onPress: () => context.selectStory(id)
                })}
            />
        )
    })

    return (
        <View style={styles.listSection} key={section.kind}>
            <Responsive
                component={Text}
                xs={{style: styles.sectionTitleXS}}
                sm={{style: styles.sectionTitle}}
                children={section.kind}
            />
            <View style={styles.listSectionItemContainer}>{SectionsItems}</View>
        </View>
    )
}

const StorySectionItem = (props: StorySectionItemProps) => {
    const {story, selected, onPress, id} = props
    return (
        <View key={story.name}>
            <TouchableOpacity onPress={onPress.bind(null, id)}>
                <Responsive
                    component={Text}
                    xs={{style: [styles.listItemTextXS, selected && styles.listItemTextActive]}}
                    sm={{style: [styles.listItemText, selected && styles.listItemTextActive]}}
                    children={story.name}
                />
            </TouchableOpacity>
        </View>
    )
}


interface StorySectionItemProps {
    story: Story
    selected: boolean
    onPress: (id: string) => any
    id: string
}

interface StorySectionProps {
    section: Section
}

interface CustomListViewProps {
    storybook: ReturnType<typeof getStorybook>
    selected: string
}

const styles = StyleSheet.create({
    listView: {
        height: "100%",
        backgroundColor: "white",
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderColor: "lightgrey",
        padding: 10,
    },
    sectionTitleXS: {fontWeight: "bold", fontSize: 18},
    sectionTitle: {fontWeight: "bold", fontSize: 22},
    listSection: {
        marginBottom: 10,
    },
    listSectionItemContainer: {
        marginLeft: 20,
    },
    listItemTextXS: {fontSize: 14},
    listItemText: {fontSize: 16},
    listItemTextActive: {fontWeight: "bold", color: "dodgerblue"}
})

export default CustomListView
