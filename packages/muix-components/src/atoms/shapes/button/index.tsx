import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type ButtonProps = {
    children?: React.ReactNode
}

export const Button = (props: ButtonProps): JSX.Element => {
    return (
        <TouchableOpacity>
            <Text>연결이 잘 되었군?!</Text>
            {props.children}
        </TouchableOpacity>
    )
}
