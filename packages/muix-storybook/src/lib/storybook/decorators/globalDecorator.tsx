import React from "react"
import {makeDecorator} from "@storybook/addons"
import {View, Text, TextProps} from "react-native"
import {Badge, BadgeProps, Box, BoxProps, Flex, Responsive, ResponsiveProvider} from "@monthem/muix"
import chroma from "chroma-js"
import { defineBreakpoints } from "../../responsive"

const colorForKind: {[index: string]: string} = {
    abstract: "dodgerblue",
    layout: "hotpink",
    shape: "fuchsia",
}

export const globalDecorator = makeDecorator({
    name: "TitleDecorator",
    parameterName: "none",
    wrapper: (getStory, c, settings) => {
        const nearestKind = c.kind.match(/[a-zA-Z]+$/g)?.join("") || "";
        const color = colorForKind[nearestKind?.toLowerCase()]
        return (
            <ResponsiveProvider>
                <View style={{flex: 1, padding: 10}}>
                    <Flex direction="row">
                        <Responsive
                            component={Text}
                            commonProps={{style: {fontWeight: "bold"}}}
                            breakpoints={defineBreakpoints<TextProps>({
                                "320px": {style: {fontSize: 30}},
                                "720px": {style: {fontSize: 50}}
                            })}
                            children={c.name}
                        />
                        <Box width={10} />
                        <Responsive
                            component={Badge}
                            commonProps={{color: chroma(color).alpha(0.2).hex(), verticalAlign: "top"}}
                            breakpoints={defineBreakpoints<BadgeProps>({
                                "320px": {padding: 3},
                                "720px": {padding: 5}
                            })}
                            children={(
                                <Responsive
                                    component={Text}
                                    commonProps={{style: {color}}}
                                    breakpoints={defineBreakpoints<TextProps>({
                                        "320px": {style: {fontSize: 10}},
                                        "720px": {style: {fontSize: 13}},
                                    })}                 
                                    children={`${nearestKind}`}
                                />
                            )}
                        />
                    </Flex>
                    <Responsive
                        component={Box}
                        commonProps={{
                            backgroundColor: "lightgrey",
                            height: 3, marginVertical: 10,
                        }}
                        breakpoints={defineBreakpoints<BoxProps>({
                            "320px": {width: 30},
                            "720px": {width: 50, marginTop: 20, marginBottom: 20}
                        })}
                    />
                    {getStory(c)}
                </View>
            </ResponsiveProvider>
        )
    }
})