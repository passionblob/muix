import React from "react"
import { View, Text, StyleProp, ViewStyle, StyleSheet, Animated } from "react-native"
import Slider from "@react-native-community/slider"
import { storiesOf } from "@storybook/react-native"
import { TransitionalAnimatedView } from "@monthem/muix"
import { getRange } from "@monthem/utils"

storiesOf("Atoms/Abstract", module)
  .add("Transitional(animated)", () => <TransitionalStory />)

const viewStyles: StyleProp<ViewStyle>[] = [
  { width: 100, height: 100, backgroundColor: "grey", transform: [{ rotateY: "-180deg" }] },
  { width: 200, height: 100, backgroundColor: "pink" },
  { width: 50, height: 100, backgroundColor: "yellow", transform: [{ rotateY: "180deg" }] },
  { backgroundColor: "purple", transform: [{ rotateY: "0deg" }, { rotateX: "180deg" }] },
  { backgroundColor: "red", borderRadius: 100, transform: [{ scale: 1.2 }] },
  { width: 100, height: 50, backgroundColor: "black", transform: [{ rotateZ: "45deg" }] },
]

const TransitionalStory = () => {
  const anim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: viewStyles.length - 1,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          useNativeDriver: false,
        })
      ])
    ).start()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <View style={{flexDirection: "row"}}>
        {getRange(0, 10).map((i) => (
          <TransitionalAnimatedView
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
            progress={anim}
            extrapolate={"clamp"}
          />
        ))}
      </View>

      <Slider
        value={0}
        onValueChange={(value) => {
          anim.setValue(value)
        }}
        style={{ height: 40, maxWidth: 300 }}
        minimumValue={0}
        maximumValue={viewStyles.length - 1}
      />
    </View>
  )
}
