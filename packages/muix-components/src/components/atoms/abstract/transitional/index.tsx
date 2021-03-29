/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Component } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { StyleOf, TransitionalProps, TransitionalSupportedComponent } from './types'
import { getInterpolatedStyle, getTransitionalStyle } from "./interpolator"
export class Transitional <C extends TransitionalSupportedComponent> extends Component<TransitionalProps<C>> {
    private anim = new Animated.Value(1)
    private prevStyle: null | StyleOf<C>
    private nextStyle: StyleOf<C>
    private progress = 0
    constructor(props: Readonly<TransitionalProps<C>>) {
        super(props)
        this.prevStyle = null
        this.nextStyle = props.defaultStyle
        this.anim.addListener(({value}) => {
            this.progress = value
        })
    }

    componentDidUpdate(): void {
        const {cases} = this.props
        const satisfyingCase = cases.find((styleCase) => styleCase[0] === true)
        const config = satisfyingCase && (satisfyingCase[2] || {})
        this.anim.stopAnimation()
        this.anim.setValue(0)
        Animated.spring(this.anim, {
            toValue: 1,
            useNativeDriver: false,
            ...config,
        }).start()
    }

    render(): JSX.Element {
        const {component, cases, commonStyle = {}, defaultStyle, children} = this.props
        const satisfyingCase = cases.find((styleCase) => styleCase[0] === true)
        const caseStyle = satisfyingCase ? satisfyingCase[1] : defaultStyle
        const mergedStyle = StyleSheet.flatten([commonStyle, caseStyle]) as StyleOf<C>
        this.prevStyle = this.prevStyle
        //@ts-ignore
            ? getInterpolatedStyle(this.prevStyle, this.nextStyle, Math.min(this.progress, 1)) as StyleOf<C>
            : mergedStyle
        this.nextStyle = mergedStyle
        //@ts-ignore
        const transitionalStyle = getTransitionalStyle(this.prevStyle, this.nextStyle, this.anim)
        const flattened = StyleSheet.flatten([commonStyle, transitionalStyle])
        return React.createElement(
        // @ts-ignore
            Animated.createAnimatedComponent(component),
            {style: flattened},
            children,
        )
    }
}

export default Transitional
