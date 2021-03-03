import React from "react"
import {defineDecorator} from "../utils"
import {ResponsiveProvider} from "@muix/muix-components"

export const decorateWithResponsiveProvider = defineDecorator((Story, c) => {
    return (
        <ResponsiveProvider>
            <Story {...c} />
        </ResponsiveProvider>
    )
})