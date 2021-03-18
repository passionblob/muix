import React, { Component } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { StyleOf, TransitionalProps, TransitionalSupportedComponent, TransitionalSupportedStyle } from './types'

const styleMapper: {
    [key in NonNullable<keyof Animated.AnimatedProps<TransitionalSupportedStyle>>]: (
        prevValue: TransitionalSupportedStyle[key],
        nextValue: TransitionalSupportedStyle[key],
        animatedValue: Animated.Value
    ) => Animated.WithAnimatedValue<TransitionalSupportedStyle[key]>
} = {
    transform: (prevValue, nextValue, animatedValue) => {
        return [{translateX: animatedValue}]
    },
}


export class Transitional <C extends TransitionalSupportedComponent> extends Component<TransitionalProps<C>> {
    private anim = new Animated.Value(0)
    private prevStyle: StyleOf<C>
    private nextStyle: StyleOf<C>
    constructor(props: Readonly<TransitionalProps<C>>) {
        super(props)
        this.prevStyle = {} as StyleOf<C>
        this.nextStyle = props.defaultStyle
    }

    render() {
        const {component, cases, commonStyle = {}, defaultStyle, children} = this.props
        const satisfyingCase = cases.find((styleCase) => styleCase[0] === true)
        const caseStyle = satisfyingCase ? satisfyingCase[1] : defaultStyle
        const mergedStyle = StyleSheet.flatten([caseStyle, commonStyle]) as StyleOf<C>
        
        this.prevStyle = this.nextStyle
        this.nextStyle = mergedStyle
        const transitionalStyle = this.getTransitionalStyle(this.prevStyle, this.nextStyle)

        return React.createElement(
            component,
            {style: mergedStyle},
            children,
        )
    }

    getTransitionalStyle(prevStyle: StyleOf<C>, nextStyle: StyleOf<C>, shouldReset?: boolean) {
        const result = {} as Animated.AnimatedProps<StyleOf<C>>

        if (!shouldReset) {
            Object.entries(prevStyle).forEach((entry) => {
                const [key, prevValue] = entry
                result[key as keyof StyleOf<C>] = prevValue
            })
        }

        Object.entries(nextStyle).forEach((entry) => {
            const [key, nextValue] = entry
            const assertedKey = key as keyof TransitionalSupportedStyle
            const prevValue = prevStyle[assertedKey] || nextValue
            result[assertedKey] = styleMapper[assertedKey](prevValue, nextValue, this.anim)
            if (assertedKey === "transform") {
                styleMapper[assertedKey]
            }
        })
    }
}

<Transitional
    component={Animated.View}
    cases={[
        [true, {}]
    ]}
    defaultStyle={{}}
/>

export default Transitional
