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
                            mxs={{style: {fontSize: 30}}}
                            mlg={{style: {fontSize: 50}}}
                            tablet={{style: {fontSize: 50}}}
                            lg={{style: {fontSize: 70}}}
                            fallback={"mxs"}
                            children={c.name}
                        />
                        <Box width={10} />
                        <Responsive
                            component={Badge}
                            commonProps={{color: chroma(color).alpha(0.2).hex(), verticalAlign: "top"}}
                            mxs={{padding: 3}}
                            mlg={{padding: 3}}
                            tablet={{padding: 3}}
                            lg={{padding: 5}}
                            children={(
                                <Responsive
                                    component={Text}
                                    commonProps={{style: {color}}}
                                    mxs={{style: {fontSize: 10}}}
                                    mlg={{style: {fontSize: 12}}}
                                    tablet={{style: {fontSize: 13}}}
                                    lg={{style: {fontSize: 15}}}
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
                        mxs={{width: 30}}
                        mlg={{width: 40}}
                        tablet={{width: 50, marginTop: 20, marginBottom: 20}}
                        lg={{width: 100, height: 8, marginTop: 30, marginBottom: 30}}
                    />
                    {getStory(c)}
                </View>
            </ResponsiveProvider>
        )
    }
})