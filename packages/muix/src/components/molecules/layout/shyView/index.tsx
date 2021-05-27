import React from 'react'
import { StyleSheet } from 'react-native';
import { TouchableStyle, TouchableStyleProps } from "../../../"

export const ShyView: React.FC<ShyViewProps> = (props) => {
  const { children, onLayout, styleOnTouch, fallbackStyle, style, ..._props } = props;

  return (
    <TouchableStyle
      fallbackStyle={StyleSheet.flatten([
        {
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0,
          shadowRadius: 5,
          elevation: 0,
          transform: [
            { perspective: 1000 },
            { rotateX: "0deg" },
            { rotateY: "0deg" },
            { scale: 1 }
          ]
        },
        fallbackStyle,
        style,
      ])}
      styleOnTouch={(info) => {
        if (!info.e) return {}
        const _styleOnTouch = typeof styleOnTouch === "function"
          ? styleOnTouch(info)
          : styleOnTouch
        const { width, height } = info.layout
        const { locationX, locationY } = info.e.nativeEvent
        const ratioX = (locationX / width) * 2 - 1
        const ratioY = (locationY / height) * 2 - 1
        const offsetX = width / 10
        const offsetY = height / 10
        return [
          style,
          {
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 20,
            shadowOffset: {
              width: ratioX * -offsetX,
              height: ratioY * -offsetY,
            },
            transform: [
              { rotateX: `${ratioY * -offsetY}deg` },
              { rotateY: `${ratioX * offsetX}deg` },
              { scale: 0.9 }
            ],
          },
          _styleOnTouch
        ]
      }}
      children={children}
    />
  )
}

export type ShyViewProps = TouchableStyleProps