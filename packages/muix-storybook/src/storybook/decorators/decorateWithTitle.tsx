import React from "react"
import {defineDecorator} from '../utils'
import {View, Text} from "react-native"

export const decorateWithTitle = defineDecorator((Story, c) => {
    return (
        <View>
            <Text style={{fontSize: 20}}>{`${c.kind}/`}</Text>
            <Text style={{fontSize: 30, fontWeight: "bold"}}>{c.name}</Text>
            <Text style={{color: "grey"}}> - - - - - - - - - - </Text>
            <Text style={{fontSize: 14, color: "grey"}}>{c.parameters.fileName}</Text>
            <Story {...c} />
        </View>
    )
})
