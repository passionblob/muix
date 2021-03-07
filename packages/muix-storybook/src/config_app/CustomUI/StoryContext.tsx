import React from "react"

export interface StoryContextValue {
    selected: string
    selectStory: (id: string) => any
}

export const StoryContext = React.createContext<StoryContextValue | undefined>(undefined)