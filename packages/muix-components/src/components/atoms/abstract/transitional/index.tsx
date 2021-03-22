import React, { Component } from 'react'
import { Animated, ColorValue, StyleSheet } from 'react-native'
import { StyleOf, TransitionalProps, TransitionalSupportedComponent, TransitionalSupportedStyle } from './types'
import chroma from "chroma-js"
import { anyOf } from '../../../../utils'

const getRgbaString = (color: ColorValue) => {
    return `rgba(${chroma(color as string).rgba().join(",")})`
}

const mapLengthToString = (length: string | number) => {
    if (typeof length === "string") return length
    return `${length}px`
}

const interpolateLength = (
    value1: string | number = 0,
    value2: string | number = 0,
    ratio: number
) => {
    let start = 0, end = 0, unit = "px"
    const length1 = mapLengthToString(value1)
    const length2 = mapLengthToString(value2)
    if (length1.match("%") && length2.match("%")) {
        unit = "%"
        start = Number(length1.replace(unit, "")),
        end = Number(length2.replace(unit, ""))
    } else if (length1.match("px") && length2.match("px")) {
        unit = "px"
        start = Number(length1.replace(unit, "")),
        end = Number(length2.replace(unit, ""))
    } else {
        return value2
    }

    return `${start + (end - start) * ratio}${unit}`
}

const mapLengthToAnimated = (
    prevValue: string | number = 0,
    nextValue: string | number = 0,
    animatedValue: Animated.Value
) => {
    let output1, output2
    const prevLength = mapLengthToString(prevValue)
    const nextLength = mapLengthToString(nextValue)

    const hasSameUnit = anyOf(
        !!prevLength.match("%") && !!nextLength.match("%"),
        !!prevLength.match("px") && !!nextLength.match("px")
    )

    if (hasSameUnit) {
        output1 = prevLength, output2 = nextLength
    } else {
        output1 = nextLength, output2 = nextLength
    }

    return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [output1, output2]
    })
}

const styleInterpolator: {
    [key in NonNullable<keyof Animated.AnimatedProps<TransitionalSupportedStyle>>]: (
        value1: TransitionalSupportedStyle[key],
        value2: TransitionalSupportedStyle[key],
        ratio: number
    ) => TransitionalSupportedStyle[key]
} = {
    backgroundColor: (value1="rgba(0,0,0,0)", value2="rgba(0,0,0,0)", ratio) => {
        const prevColor = getRgbaString(value1)
        const nextColor = getRgbaString(value2)
        return getRgbaString(chroma.scale([prevColor, nextColor])(ratio).hex())
    },
    width: interpolateLength,
    height: interpolateLength,
    margin: interpolateLength,
    marginBottom: interpolateLength,
    marginEnd: interpolateLength,
    marginHorizontal: interpolateLength,
    marginLeft: interpolateLength,
    marginRight: interpolateLength,
    marginStart: interpolateLength,
    marginTop: interpolateLength,
    marginVertical: interpolateLength,
    maxHeight: interpolateLength,
    maxWidth: interpolateLength,
    minHeight: interpolateLength,
    minWidth: interpolateLength,
    padding: interpolateLength,
    paddingBottom: interpolateLength,
    paddingEnd: interpolateLength,
    paddingHorizontal: interpolateLength,
    paddingLeft: interpolateLength,
    paddingRight: interpolateLength,
    paddingStart: interpolateLength,
    paddingTop: interpolateLength,
    paddingVertical: interpolateLength,
    top: interpolateLength,
    left: interpolateLength,
    right: interpolateLength,
    bottom: interpolateLength,
    flexBasis: interpolateLength
}

const styleMapper: {
    [key in NonNullable<keyof Animated.AnimatedProps<TransitionalSupportedStyle>>]: (
        prevValue: TransitionalSupportedStyle[key],
        nextValue: TransitionalSupportedStyle[key],
        animatedValue: Animated.Value
    ) => Animated.WithAnimatedValue<TransitionalSupportedStyle[key]>
} = {
    transform: (prevValue, nextValue, animatedValue) => {
        // TODO
        return [{translateX: animatedValue}]
    },
    backgroundColor: (prevValue="rgba(0,0,0,0)", nextValue, animatedValue) => {
        const prevColor = `rgba(${chroma(prevValue as string).rgba().join(",")})`
        const nextColor = `rgba(${chroma(nextValue as string).rgba().join(",")})`
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [prevColor, nextColor]
        })
    },
    width: mapLengthToAnimated,
    height: mapLengthToAnimated,
    margin: mapLengthToAnimated,
    marginBottom: mapLengthToAnimated,
    marginEnd: mapLengthToAnimated,
    marginHorizontal: mapLengthToAnimated,
    marginLeft: mapLengthToAnimated,
    marginRight: mapLengthToAnimated,
    marginStart: mapLengthToAnimated,
    marginTop: mapLengthToAnimated,
    marginVertical: mapLengthToAnimated,
    maxHeight: mapLengthToAnimated,
    maxWidth: mapLengthToAnimated,
    minHeight: mapLengthToAnimated,
    minWidth: mapLengthToAnimated,
    padding: mapLengthToAnimated,
    paddingBottom: mapLengthToAnimated,
    paddingEnd: mapLengthToAnimated,
    paddingHorizontal: mapLengthToAnimated,
    paddingLeft: mapLengthToAnimated,
    paddingRight: mapLengthToAnimated,
    paddingStart: mapLengthToAnimated,
    paddingTop: mapLengthToAnimated,
    paddingVertical: mapLengthToAnimated,
    top: mapLengthToAnimated,
    left: mapLengthToAnimated,
    right: mapLengthToAnimated,
    bottom: mapLengthToAnimated,
    flexBasis: mapLengthToAnimated
}


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
            if (assertedKey in styleMapper) {
                result[assertedKey] = styleMapper[assertedKey](prevValue, nextValue, this.anim)
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
