import { ScreenSizeType } from "@muix/muix-components/src"

export const storybookLayout: {[T in ScreenSizeType]: {
    listViewWidth: number,
}} = {
    xs: {
        listViewWidth: 200,
    },
    sm: {
        listViewWidth: 270,
    },
    lg: {
        listViewWidth: 270,
    },
    md: {
        listViewWidth: 270,
    },
    xl: {
        listViewWidth: 270,
    }
}

export const getStoryId = (section: Section, story: Story) => `${section.kind}--${story.name}`

export interface Story {
    name: string
    render: () => JSX.Element
}

export interface Section {
    kind: string
    fileName: string
    stories: Story[]
}

export type Storybook = Section[]
