import { ViewStyle, TextStyle, Animated, ImageStyle, View, Image, StyleProp } from "react-native"

export interface TransitionConfig extends Omit<Animated.SpringAnimationConfig, "toValue" | "useNativeDriver"> {
    reset?: boolean
}

export interface TransitionalProps<C extends TransitionalSupportedComponent> {
    component: C
    //@ts-ignore
    props?: Omit<React.ComponentProps<C>, "style">
    commonStyle?: StyleOf<C>
    defaultStyle: StyleOf<C>
    cases: [boolean, StyleOf<C>, TransitionConfig?][]
    children?: React.ReactNode
}

export type TransitionalSupportedComponent = typeof View | typeof Text | typeof Image

export type TransitionalSupportedStyle = Partial<ViewStyle & TextStyle & ImageStyle>
export type StyleOf<C extends TransitionalSupportedComponent> = 
    C extends typeof View ? StyleProp<ViewStyle> 
    : C extends typeof Text ? StyleProp<TextStyle>
    : C extends typeof Image ? StyleProp<ImageStyle>
    : never;