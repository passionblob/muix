import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

type ButtonProps = {
    children?: React.ReactNode
}

export const Button = (props: ButtonProps) => {
    return (
        <TouchableOpacity>
            <Text>연결이 잘 되었군?!</Text>
            {props.children}
        </TouchableOpacity>
    )
}
