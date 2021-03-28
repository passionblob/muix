import { View, ViewStyle, TextStyle, Animated, ImageStyle } from "react-native"

export interface TransitionOption {
    reset?: boolean
}

export interface TransitionalProps<C extends TransitionalSupportedComponent> {
    component: C
    commonStyle?: StyleOf<C>
    defaultStyle: StyleOf<C>
    cases: [boolean, StyleOf<C>, TransitionOption?][]
}

export type TransitionalSupportedComponent =
    typeof Animated.View
    | typeof Animated.Text
    | typeof Animated.Image
    | typeof Animated.ScrollView
    | typeof Animated.SectionList
    | typeof Animated.FlatList

export type TransitionalSupportedStyle = Partial<ViewStyle & TextStyle & ImageStyle>
export type StyleOf<C extends TransitionalSupportedComponent> = 
    C extends typeof Animated.View ? ViewStyle 
    : C extends typeof Animated.Text ? TextStyle
    : C extends typeof Animated.Image ? ImageStyle
    : never;
