import { ViewStyle, TextStyle, Animated, ImageStyle, View, Image, StyleProp } from "react-native"

export interface TransitionOption extends Omit<Animated.SpringAnimationConfig, "toValue" | "useNativeDriver"> {
    reset?: boolean
}

export interface TransitionalProps<C extends TransitionalSupportedComponent> {
    component: C
    commonStyle?: StyleOf<C>
    defaultStyle: StyleOf<C>
    cases: [boolean, StyleOf<C>, TransitionOption?][]
}

export type TransitionalSupportedComponent = typeof View | typeof Text | typeof Image

export type TransitionalSupportedStyle = Partial<ViewStyle & TextStyle & ImageStyle>
export type StyleOf<C extends TransitionalSupportedComponent> = 
    C extends typeof View ? StyleProp<ViewStyle> 
    : C extends typeof Text ? StyleProp<TextStyle>
    : C extends typeof Image ? StyleProp<ImageStyle>
    : never;
