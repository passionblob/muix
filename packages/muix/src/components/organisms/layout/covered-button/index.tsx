import React from 'react';
import { View, Text, ViewProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { TouchableStyle, TransitionalText, TransitionalView } from '@monthem/muix';
import { useSpringToggle } from '@monthem/muix';
import { SpringValue } from '@react-spring/core';

export const CoveredButton = (props: CoveredButtonProps) => {
  const {
    style,
    buttonStyle,
    buttonText,
    buttonTextStyle,
    onPressButton,
    title,
    titleStyle,
    subTitle,
    subTitleStyle,
    coverContent,
    coverStyle,
    onToggle,
    ..._props
  } = props
  const [progress, toggle, toggled] = useSpringToggle()
  const [dummy, setDummy] = React.useState(0)

  const _toggle = () => {
    toggle()
    if (onToggle) {
      onToggle(toggled.current)
    }
  }

  const forceUpdate = () => {
    setDummy(dummy + 1)
  }

  const size = React.useRef({
    subTextHeight: 0,
    buttonHeight: 0,
  }).current

  const capturedSize = () => size.buttonHeight > 0 && size.subTextHeight > 0

  return (
    <View
      {..._props}
      //@ts-ignore
      style={[{ userSelect: "none" }, style]}
    >
      <TransitionalView
        progress={progress}
        fallbackStyle={{
          width: "100%",
          flex: 1,
          zIndex: 2,
          marginBottom: 0,
        }}
        styles={[
          {},
          { marginBottom: size.buttonHeight + 5 }
        ]}
      >
        <TouchableStyle
          fallbackStyle={[{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 5,
            opacity: 1,
            transform: [
              { scale: 1 }
            ]
          }, coverStyle]}
          styleOnTouch={{
            opacity: 0.5,
            transform: [
              { scale: 1.05 }
            ]
          }}
          onPress={_toggle}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
            children={typeof coverContent === "function"
              ? coverContent(progress, _toggle)
              : coverContent
            }
          />
          <View style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
          }}>
            <TransitionalText
              progress={progress}
              onLayout={(e) => {
                if (capturedSize()) return
                size.subTextHeight = e.nativeEvent.layout.height
                if (size.buttonHeight > 0) forceUpdate()
              }}
              fallbackStyle={[{
                color: "white",
                fontSize: 12,
                overflow: "hidden",
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: 5,
                paddingBottom: 0,
                opacity: 1,
              }, subTitleStyle]}
              styles={[
                {
                  transform: [
                    {scaleY: 1},
                    {translateY: 0}
                  ]
                },
                {
                  opacity: 0,
                  transform: [
                    {scaleY: 0},
                    {translateY: size.subTextHeight / 2}
                  ],
                }
              ]}
            >
              {subTitle}
            </TransitionalText>
            <TransitionalText
              progress={progress}
              fallbackStyle={[{
                color: "white",
                fontWeight: "bold",
                fontSize: 14,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                padding: 5,
                paddingTop: 0
              }, titleStyle]}
              styles={[
                { paddingTop: 0 },
                { paddingTop: 5 }
              ]}>
              {title}
            </TransitionalText>
          </View>
        </TouchableStyle>
      </TransitionalView>

      <TransitionalView
        progress={progress}
        fallbackStyle={{
          position: "absolute",
          width: "100%",
          zIndex: 1,
          height: "100%",
          opacity: 0,
          transform: [
            { translateY: -20 }
          ]
        }}
        styles={[
          {},
          {
            width: "100%",
            opacity: 1,
            transform: [
              { translateY: 0 }
            ]
          }
        ]}
      >
        <TouchableStyle
          onLayout={(e) => {
            if (capturedSize()) return
            size.buttonHeight = e.nativeEvent.layout.height
            if (size.subTextHeight > 0) forceUpdate()
          }}
          fallbackStyle={[{
            position: "absolute",
            bottom: 0,
            width: "100%",
            paddingVertical: 5,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            overflow: "hidden",
            borderRadius: 5,
            opacity: 1,
            transform: [
              { scale: 1 }
            ]
          }, buttonStyle]}
          styleOnTouch={{
            opacity: 0.5,
            transform: [
              { scale: 1.05 }
            ]
          }}
          onPress={onPressButton}
        >
          <Text style={[{color: "white"}, buttonTextStyle]}>
            {buttonText}
          </Text>
        </TouchableStyle>
      </TransitionalView>
    </View>
  )
}

export interface CoveredButtonProps extends ViewProps {
  title?: string
  titleStyle?: StyleProp<TextStyle>
  subTitle?: string
  subTitleStyle?: StyleProp<TextStyle>
  buttonStyle?: StyleProp<ViewStyle>
  buttonTextStyle?: StyleProp<TextStyle>
  buttonText?: string
  onPressButton?: () => void
  coverContent?: JSX.Element | ((progress: SpringValue<number>, toggle: () => void) => JSX.Element)
  coverStyle?: StyleProp<ViewStyle>
  onToggle?: (toggled: boolean) => void
}
