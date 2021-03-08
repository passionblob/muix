import React from "react"
import {makeDecorator} from '@storybook/addons'
import {View, Text} from "react-native"
import {Badge, Box, Flex, Responsive, ResponsiveProvider} from "@muix/muix-components"
import chroma from "chroma-js"

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
                            xs={{style: {fontSize: 30}}}
                            sm={{style: {fontSize: 50}}}
                            fallback={"sm"}
                            children={c.name}
                        />
                        <Box width={10} />
                        <Responsive
                            component={Badge}
                            commonProps={{color: chroma(color).alpha(0.2).hex(), verticalAlign: "top"}}
                            xs={{padding: 3}}
                            children={(
                                <Responsive
                                    component={Text}
                                    commonProps={{style: {color}}}
                                    xs={{style: {fontSize: 10}}}
                                    sm={{style: {fontSize: 13}}}
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
                        xs={{width: 30}}
                        sm={{width: 50}}
                    />
                    {getStory(c)}
                </View>
            </ResponsiveProvider>
        )
    }
})