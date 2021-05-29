import React from 'react';
import { Animated, View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { CoveredButton } from '@monthem/muix';
import { animated } from '@react-spring/native';
import { Svg, Path } from "react-native-svg"
import { Check, syncAnimatedToSpring } from '@monthem/muix/src';
import chroma from 'chroma-js';
import WebColors from '@monthem/web-color';

const CoveredButtonStory = () => {
  const anim = React.useRef(new Animated.Value(0)).current

  return (
    <View>
      <CoveredButton
        coverContent={(progress) => {
          syncAnimatedToSpring({
            anim,
            spring: progress,
            config: {
              delay: 100,
            }
          })

          return (
            <View style={{ flex: 1, backgroundColor: "blue" }}>
              <animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  marginTop: 5,
                  marginRight: 5,
                  width: 30,
                  height: 30,
                  opacity: progress.to({
                    range: [0, 1],
                    output: [0, 1]
                  }),
                  borderRadius: 50,
                  backgroundColor: chroma(WebColors.Black).alpha(0.4).hex(),
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Check style={{width: 20, height: 20}} anim={anim} />
              </animated.View>
            </View>
          )
        }}
        title={"에니어그램"}
        subTitle={"나의 내면 발견하기"}
        buttonText={"자세히 보기"}
        style={{ height: 125, width: 120 }}
      />
    </View>
  )
}

storiesOf("Organisms/Layout", module)
  .add("CoveredButton", () => <CoveredButtonStory />)
