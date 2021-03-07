import { ResponsiveProvider } from "@muix/muix-components/src";
import React from "react";
import { StoryProps } from "../type";
import { makeDecorator } from "@storybook/addons"

export const decorateWithResponsive = makeDecorator({
    name: "ResponsiveDecorator",
    parameterName: "none",
    wrapper: (getStory, c, settings) => {
        return (
            <ResponsiveProvider>
                {getStory(c)}
            </ResponsiveProvider>
        )
    },
})