import React from "react"
import { View, StyleProp, ViewStyle, Animated } from "react-native"
import Slider from "@react-native-community/slider"
import { useSpring } from "@react-spring/native"
import { storiesOf } from "@storybook/react-native"
import { TransitionalView } from "@monthem/muix"
import { getRange } from "@monthem/utils"
import { Flex } from "@monthem/muix/src"

storiesOf("Atoms/Abstract", module)
  .add("Transitional(spring)", () => <TransitionalStory />)

const viewStyles: StyleProp<ViewStyle>[] = [
  { width: 100, height: 100, backgroundColor: "grey", transform: [{ rotateY: "-180deg" }] },
  { width: 200, height: 100, backgroundColor: "pink" },
  { width: 50, height: 100, backgroundColor: "yellow", transform: [{ rotateY: "180deg" }] },
  { backgroundColor: "purple", transform: [{ rotateY: "0deg" }, { rotateX: "180deg" }] },
  { backgroundColor: "red", borderRadius: 100, transform: [{ scale: 1.2 }] },
  { width: 100, height: 50, backgroundColor: "black", transform: [{ rotateZ: "45deg" }] },
]

const TransitionalStory = () => {
  const [spring, api] = useSpring(() => ({
    progress: 0
  }))

  React.useEffect(() => {
    const startToEnd = () => {
      api.start({
        progress: viewStyles.length - 1,
        onRest: endToStart,
      })
    }

    const endToStart = () => {
      api.start({
        progress: 0,
        onRest: startToEnd,
      })
    }

    startToEnd()

  }, [])

  return (
    <View style={{ flex: 1 }}>
      <View style={{flexDirection: "row"}}>
        {getRange(0, 10).map((i) => (
          <TransitionalView
            key={i}
            fallbackStyle={{
              transform: [
                { rotateX: "0deg" },
                { rotateY: "0deg" },
                { rotateZ: "0deg" },
                { scale: 1 },
              ],
              width: 100,
              height: 100,
              backgroundColor: "grey",
              borderRadius: 0,
            }}
            //@ts-ignore
            styles={viewStyles}
            progress={spring.progress}
            extrapolate={"clamp"}
          />
        ))}
      </View>

      <Slider
        value={0}
        onValueChange={(value) => {
          api.set({ progress: value })
        }}
        style={{ height: 40, maxWidth: 300 }}
        minimumValue={0}
        maximumValue={viewStyles.length - 1}
      />
    </View>
  )
}
