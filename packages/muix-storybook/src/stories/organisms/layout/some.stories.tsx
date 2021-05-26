import React from 'react';
import { Pressable, View, ViewStyle, Text, ViewProps } from 'react-native';
import { TouchableStyle, TransitionalText, TransitionalView, Typewriter } from '@monthem/muix';
import { storiesOf } from '@storybook/react-native';
import { useSpring, useTrail } from '@react-spring/core';

const styles: { [s: string]: ViewStyle[] } = {
  top: [
    {
      marginBottom: 0,
    },
    {
      marginBottom: 35,
    }
  ],
  bottom: [
    {
      display: "none",
      transform: [
        { translateY: -20 }
      ]
    },
    {
      width: "100%",
      opacity: 1,
      display: "flex",
      transform: [
        { translateY: 0 }
      ]
    }
  ]
}

const Some = (props: SomeProps) => {
  const { style, ..._props } = props
  const toggled = React.useRef(false)
  const [spring, springApi] = useSpring(() => ({
    progress: 0,
    config: {
      tension: 300,
      bounce: 0,
    }
  }))

  const toggle = () => {
    springApi.start({
      progress: toggled.current ? 0 : 1,
    })
    toggled.current = !toggled.current
  }

  return (
    <View
      {..._props}
      //@ts-ignore
      style={[{ userSelect: "none" }, style]}
    >
      <TransitionalView
        progress={spring.progress}
        fallbackStyle={{
          width: "100%",
          flex: 1,
          zIndex: 2,
          marginBottom: 0,
        }}
        styles={styles.top}
      >
        <TouchableStyle
          fallbackStyle={{
            width: "100%",
            height: "100%",
            backgroundColor: "blue",
            overflow: "hidden",
            borderRadius: 10,
            opacity: 1,
            transform: [
              { scale: 1 }
            ]
          }}
          styleOnTouch={{
            opacity: 0.5,
            transform: [
              { scale: 1.05 }
            ]
          }}
          onPress={toggle}
        >
          <View style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
          }}>
            <TransitionalText
              progress={spring.progress}
              fallbackStyle={{
                color: "white",
                fontSize: 10,
                overflow: "hidden",
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: 5,
                paddingBottom: 0,
              }}
              styles={[
                { opacity: 1, transform: [{ scaleY: 1 }, { translateY: 0 }] },
                { opacity: 0, transform: [{ scaleY: 0 }, { translateY: 30 }] }
              ]}
            >
              나의 내면 발견하기
            </TransitionalText>
            <TransitionalText
              progress={spring.progress}
              fallbackStyle={{
                color: "white",
                fontSize: 14,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                padding: 5,
                paddingTop: 0
              }}
              styles={[
                { paddingTop: 0 },
                { paddingTop: 5 }
              ]}>
              에니어그램
            </TransitionalText>
          </View>
        </TouchableStyle>
      </TransitionalView>

      <TransitionalView
        progress={spring.progress}
        fallbackStyle={{
          width: "100%",
          marginTop: 0,
          position: "absolute",
          zIndex: 1,
          bottom: 0,
          height: 30,
          opacity: 0,
        }}
        styles={styles.bottom}
      >
        <TouchableStyle
          fallbackStyle={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "lightgrey",
            overflow: "hidden",
            borderRadius: 5,
            opacity: 1,
            transform: [
              { scale: 1 }
            ]
          }}
          styleOnTouch={{
            opacity: 0.5,
            transform: [
              { scale: 1.05 }
            ]
          }}
          onPress={() => console.log("괜춘한듯?")}
        >
          <Text style={{ fontWeight: "bold" }}>
            자세히 보기
          </Text>
        </TouchableStyle>
      </TransitionalView>
    </View>
  )
}

interface SomeProps extends ViewProps {

}

const ChoiceSliderStory = () => {
  return (
    <View>
      <Some style={{ height: 125, width: 120 }} />
    </View>
  )
}

storiesOf("Organisms/Layout", module)
  .add("Some", () => <ChoiceSliderStory />)
