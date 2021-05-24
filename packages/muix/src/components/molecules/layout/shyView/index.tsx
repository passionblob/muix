import React from 'react'
import { TouchableStyle, TouchableStyleProps } from "../../../"

export const ShyView: React.FC<ShyViewProps> = (props) => {
  const { children, onLayout, styleOnTouch, ..._props } = props;

  const layout = React.useRef({
    height: 0,
    width: 0,
  })

  return (
    <TouchableStyle
      {..._props}
      onLayout={(e) => {
        layout.current = e.nativeEvent.layout
        if (onLayout) onLayout(e)
      }}
      styleOnTouch={(e) => {
        const { locationX, locationY } = e.nativeEvent
        const relativeX = locationX / layout.current.width
        const relativeY = locationY / layout.current.height
        const style = typeof styleOnTouch === "function"
          ? styleOnTouch(e)
          : styleOnTouch

        return [
          {
            transform: [
              { scale: 0.95 },
              { rotateY: `${(relativeX * 2 - 1) * 30}deg` },
              { rotateX: `${(relativeY * 2 - 1) * -30}deg` }
            ],
            shadowOffset: {
              width: (relativeY * 2 - 1) * -10,
              height: (relativeX * 2 - 1) * 10
            },
            shadowRadius: 20,
            shadowOpacity: 0.5,
          },
          style,
          props.style,
        ]
      }}
    >
      {children}
    </TouchableStyle>
  )
}

export type ShyViewProps = TouchableStyleProps