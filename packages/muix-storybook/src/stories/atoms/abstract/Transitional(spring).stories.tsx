import React from "react"
import { View } from "react-native"
import Slider from "@react-native-community/slider"
import { useSpring } from "@react-spring/native"
import { storiesOf } from "@storybook/react-native"

import { TransitionalText, TransitionalView } from "@monthem/muix"
import { animated } from "@react-spring/web"

storiesOf("Atoms/Abstract", module)
  .add("Transitional(spring)", () => <TransitionalStory />)

const TransitionalStory = () => {
  const [spring, api] = useSpring(() => ({
    progress: -1
  }))

  return (
    <View style={{ flex: 1 }}>
      <TransitionalText
        range={[-1, 0, 1]}
        progress={spring.progress}
        styles={[
          { fontSize: 14, color: "red" },
          { fontSize: 20, color: "blue" },
          { fontSize: 30, color: "green" },
        ]}>
        슬라이드를 좌우로 흔들어! Progress= 
        <animated.text>
          {spring.progress.to((value) => Math.floor(value * 100) / 100)}
        </animated.text>
      </TransitionalText>
      <TransitionalView
        range={[-1, 0, 1]}
        styles={[
          { width: 100, height: 100, backgroundColor: "grey" },
          { width: 150, height: 120, backgroundColor: "pink" },
          { width: 120, height: 150, backgroundColor: "yellow" },
        ]}
        progress={spring.progress}
      />

      <Slider
        value={-1}
        onValueChange={(value) => api.set({ progress: value })}
        style={{ height: 40, maxWidth: 300 }}
        minimumValue={-1}
        maximumValue={1}
      />
    </View>
  )
}
