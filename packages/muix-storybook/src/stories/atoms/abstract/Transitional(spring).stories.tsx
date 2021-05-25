import React from "react"
import { View, Text, StyleProp, ViewStyle, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"
import { useSpring } from "@react-spring/native"
import { storiesOf } from "@storybook/react-native"

import { TransitionalText, TransitionalView } from "@monthem/muix"
import { animated } from "@react-spring/web"
import WebColors from "@monthem/web-color"

storiesOf("Atoms/Abstract", module)
  .add("Transitional", () => <TransitionalStory />)

const viewStyles: StyleProp<ViewStyle>[] = [
  { width: 100, height: 100, backgroundColor: "grey", transform: [{ rotateY: "-180deg" }] },
  { width: 200, height: 100, backgroundColor: "pink"},
  { width: 50, height: 100, backgroundColor: "yellow", transform: [{ rotateY: "180deg" }] },
  { backgroundColor: "purple", transform: [{ rotateY: "0deg" }, { rotateX: "180deg" }] },
  { backgroundColor: "red", borderRadius: 100, transform: [{scale: 1.2}] },
  { width: 100, height: 50, backgroundColor: "black", transform: [{ rotateZ: "45deg" }] },
]

const textStyles = [
  { fontSize: 14, color: "red" },
  { fontSize: 20, color: "blue" },
  { fontSize: 14, color: "green" },
  { fontSize: 20, color: WebColors.FireBrick },
  { fontSize: 14, color: WebColors.ForestGreen },
  { fontSize: 20, color: WebColors.Indigo },
]

const TransitionalStory = () => {
  const [spring, api] = useSpring(() => ({
    progress: 0
  }))

  return (
    <View style={{ flex: 1 }}>
      <Text>
        Progress=
        <animated.text>
          {spring.progress.to((value) => Math.floor(value * 100) / 100)}
        </animated.text>
      </Text>
      <TransitionalText
        progress={spring.progress}
        styles={textStyles}
        extrapolate={"clamp"}
      >
        스타일이 몇 개든 상관없다!
      </TransitionalText>
      <TransitionalText
        progress={spring.progress}
        styles={textStyles}
        extrapolate={"clamp"}
      >
        슬라이드를 좌우로 움직여!
      </TransitionalText>
      <TransitionalView
        fallbackStyle={{
          transform: [
            { rotateX: "0deg" },
            { rotateY: "0deg" },
            { scale: 1 },
          ],
          width: 100,
          height: 100,
          backgroundColor: "grey",
          borderRadius: 0,
        }}
        styles={viewStyles}
        progress={spring.progress}
        extrapolate={"clamp"}
      />

      <Slider
        value={0}
        onValueChange={(value) => {
          api.set({ progress: value })
        }}
        style={{ height: 40, maxWidth: 300 }}
        minimumValue={0}
        maximumValue={Math.max(textStyles.length - 1, viewStyles.length - 1)}
      />
    </View>
  )
}
