import React, { Component } from 'react'
import { Animated, ColorValue, StyleSheet } from 'react-native'
import { StyleOf, TransitionalProps, TransitionalSupportedComponent } from './types'
import { animatedStyleMappeer, styleInterpolator } from "./interpolator"
export class Transitional <C extends TransitionalSupportedComponent> extends Component<TransitionalProps<C>> {
    private anim = new Animated.Value(0)
    private prevStyle: StyleOf<C>
    private nextStyle: StyleOf<C>
    private progress: number = 0
    constructor(props: Readonly<TransitionalProps<C>>) {
        super(props)
        this.prevStyle = {} as StyleOf<C>
        this.nextStyle = props.defaultStyle
        this.anim.addListener(({value}) => {
            this.progress = value
        })
    }

    componentDidUpdate() {
        this.anim.setValue(0)
        Animated.timing(this.anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start()
    }

    render() {
        const {component, cases, commonStyle = {}, defaultStyle, children} = this.props
        const satisfyingCase = cases.find((styleCase) => styleCase[0] === true)
        const caseStyle = satisfyingCase ? satisfyingCase[1] : defaultStyle
        const mergedStyle = StyleSheet.flatten([commonStyle, caseStyle]) as StyleOf<C>
        this.prevStyle = this.getInterpolatedStyle(this.prevStyle, this.nextStyle, this.progress)
        this.nextStyle = mergedStyle
        const transitionalStyle = this.getTransitionalStyle(this.prevStyle, this.nextStyle)
        const flattened = StyleSheet.flatten([commonStyle, transitionalStyle])

        return React.createElement(
            component,
            {style: flattened},
            children,
        )
    }

    getInterpolatedStyle(style1: StyleOf<C>, style2: StyleOf<C>, ratio: number) {
        const result = {} as StyleOf<C>
        Object.entries(style2).forEach((entry) => {
            const [key, nextValue] = entry
            const assertedKey = key as keyof StyleOf<C>
            const prevValue = style1[assertedKey] || nextValue
            if (assertedKey in styleInterpolator) {
                result[assertedKey] = styleInterpolator[assertedKey](prevValue, nextValue, ratio)
            }
        })

        return result
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
            const assertedKey = key as keyof StyleOf<C>
            const prevValue = prevStyle[assertedKey] || nextValue
            if (assertedKey in animatedStyleMappeer) {
                result[assertedKey] = animatedStyleMappeer[assertedKey](prevValue, nextValue, this.anim)
            }
        })

        return result
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
