import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

type ButtonProps = {
    children?: React.ReactNode
}

export const Button = (props: ButtonProps) => {
    return (
        <TouchableOpacity>
            {props.children}
        </TouchableOpacity>
    )
}
