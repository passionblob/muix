import React from "react"
import { getStorybook } from "@storybook/react-native"
import { Animated, SafeAreaView, StyleSheet, View, ViewStyle } from "react-native"
import CustomListView from "./CustomListView"
import { Responsive, ResponsiveProvider, ScreenSizeType } from "@muix/muix-components/src"
import CustomBottomTab from "./CustomBottomTab"
import StoryProvider from "./StoryProvider"
import StoryConsumer from "./StoryConsumer"
import CustomStoryView from "./CustomStoryView"
import { getStoryId, Story, Storybook, storybookLayout } from "./shared"

const tabs = [
    "Navigate",
    "Preview",
    "Addons",
] as const

class CustomStoryUI extends React.Component<{}, CustomStoryUIState> {
    private previewVisibleAnim = new Animated.Value(0)
    
    constructor(props: Readonly<{}>) {
        super(props)
        this.state = {
            currentTab: "Navigate",
            storybook: getStorybook(),
        }
    }

    componentDidUpdate() {
        const toValue = this.state.currentTab !== "Navigate" ? 1 : 0
        this.previewVisibleAnim.stopAnimation()
        this.previewVisibleAnim.setValue(toValue)
        // Animated.timing(this.previewVisibleAnim, {
        //     toValue,
        //     useNativeDriver: false
        // }).start()
    }

    render() {
        const {currentTab, storybook} = this.state;
        const {previewVisibleAnim} = this;
        const flatStories = this.flattenStorybook(storybook)
        return (
            <StoryProvider>
            <ResponsiveProvider>
                <View style={{flex: 1}}>
                    <SafeAreaView style={styles.absoluteScreenSize}>
                        <Responsive render={(responsive) => {
                            const {screen} = responsive;
                            const {listViewWidth} = storybookLayout[screen.sizeType]
                            const translateX = previewVisibleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -listViewWidth]
                            })
                            return (
                                <Animated.View style={{transform: [{translateX}]}}>
                                    <StoryConsumer
                                        component={CustomListView}
                                        props={(context) => ({
                                            storybook,
                                            selected: context.selected,
                                        })}
                                    />
                                </Animated.View>
                            )
                        }}/>
                        <Responsive render={(responsive) => {
                            const {screen} = responsive;
                            const {listViewWidth} = storybookLayout[screen.sizeType]
                            const availableWidth = screen.width - listViewWidth
                            const scaleForFit = availableWidth / screen.width
                            const scaleForAligningToTopRight = (1 - scaleForFit) / 2 * 100
                            const leftAndBottom = previewVisibleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [`${scaleForAligningToTopRight}%`, `0%`]
                            });

                            const scale = previewVisibleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [scaleForFit, 1]
                            })

                            const borderWidth = previewVisibleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0],
                            })

                            const animatedViewStyle: Animated.WithAnimatedObject<ViewStyle> = {
                                left: leftAndBottom,
                                bottom: leftAndBottom,
                                borderBottomWidth: borderWidth,
                                borderTopWidth: borderWidth,
                                borderColor: "lightgrey",
                                transform: [{scale}]
                            }
                            return (
                                <Animated.View style={[styles.absoluteScreenSize, animatedViewStyle]}>
                                    <StoryConsumer
                                        component={CustomStoryView}
                                        props={(context) => ({
                                            story: flatStories[context.selected]
                                        })}
                                    />
                                </Animated.View>
                            )
                        }} />
                    </SafeAreaView>
                </View>
                <CustomBottomTab tabs={tabs.map((text) => ({
                    text,
                    onPressTab: this.setCurrentTab.bind(this, text),
                    active: text === currentTab,
                }))} />
            </ResponsiveProvider>
            </StoryProvider>
        )
    }

    setCurrentTab(tab: CustomStoryUIState["currentTab"]) {
        this.setState({currentTab: tab})
    }

    flattenStorybook(storybook: Storybook) {
        return storybook.map((section) => {
            return section.stories.map((story) => {
                return [getStoryId(section, story), story] as const
            })
        })
        .flat()
        .reduce<{[index: string]: Story}>((acc, entry) => {
            acc[entry[0]] = entry[1]
            return acc
        }, {})
    }
}

interface CustomStoryUIState {
    currentTab: typeof tabs[number]
    storybook: Storybook
}

const styles = StyleSheet.create({
    absoluteScreenSize: {
        position: "absolute",
        width: "100%", height: "100%",
    }
})

export default CustomStoryUI