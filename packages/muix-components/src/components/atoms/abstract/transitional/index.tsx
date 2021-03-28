import React, { Component } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { StyleOf, TransitionalProps, TransitionalSupportedComponent } from './types'
import { getInterpolatedStyle, getTransitionalStyle } from "./interpolator"
export class Transitional <C extends TransitionalSupportedComponent> extends Component<TransitionalProps<C>> {
    private anim = new Animated.Value(0)
    private prevStyle: StyleOf<C>
    private nextStyle: StyleOf<C>
    private progress = 0
    constructor(props: Readonly<TransitionalProps<C>>) {
        super(props)
        this.prevStyle = {} as StyleOf<C>
        this.nextStyle = props.defaultStyle
        this.anim.addListener(({value}) => {
            this.progress = value
        })
    }

    componentDidUpdate(): void {
        this.anim.stopAnimation()
        this.anim.setValue(0)
        Animated.spring(this.anim, {
            toValue: 1,
            useNativeDriver: false,
        }).start()
    }

    render(): JSX.Element {
        const {component, cases, commonStyle = {}, defaultStyle, children} = this.props
        const satisfyingCase = cases.find((styleCase) => styleCase[0] === true)
        const caseStyle = satisfyingCase ? satisfyingCase[1] : defaultStyle
        const mergedStyle = StyleSheet.flatten([commonStyle, caseStyle]) as StyleOf<C>
        this.prevStyle = getInterpolatedStyle(this.prevStyle, this.nextStyle, this.progress) as StyleOf<C>
        this.nextStyle = mergedStyle
        const transitionalStyle = getTransitionalStyle(this.prevStyle, this.nextStyle, this.anim)
        const flattened = StyleSheet.flatten([commonStyle, transitionalStyle])

        return React.createElement(
            component,
            {style: flattened},
            children,
        )
    }
}

export default Transitional
