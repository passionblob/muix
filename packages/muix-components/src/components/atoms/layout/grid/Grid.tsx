import React from 'react'
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native'

export const Grid: React.FC<GridProps> = (props) => {
    const {
        columnCount = 4,
        rowHeight = 100,
        containerStyle,
        marginBetweenHorizontal = 5,
        marginBetweenVertical = 5,
        rowStyle = {},
        gridStyle = {},
    } = props;

    const children = React.Children.toArray(props.children)
    const rowCount = Math.ceil(children.length / columnCount)
    const rows = Array(rowCount).fill(0)
        .map(() => Array(columnCount).fill(0))

    const grid = rows.map((row, i) => {
        const marginTop = i > 0 ? marginBetweenVertical : undefined
        const _rowStyle: ViewStyle = StyleSheet.flatten([rowStyle, {
            height: rowHeight,
            flex: 1,
            marginTop,
            flexDirection: "row"
        }])

        return (
            <View key={i} style={_rowStyle}>
                {row.map((_, j) => {
                    const flatIndex = i * columnCount + j
                    const child = children[flatIndex]
                    const isLastColumn = (j + 1) % columnCount === 0
                    const marginRight = isLastColumn ? undefined : marginBetweenHorizontal
                    const flattenedGridStyleProp = StyleSheet.flatten(gridStyle)
                    const {backgroundColor, ...gridStyleProp} = flattenedGridStyleProp
                    const _gridStyle: ViewStyle = StyleSheet.flatten([gridStyleProp, {
                        marginRight,
                        backgroundColor: !!child ? backgroundColor : "transparent",
                        flex: 1
                    }])

                    return (
                        <View key={flatIndex} style={_gridStyle}>
                            {child}
                        </View>
                    )
                })}
            </View>
        )
    })
    return (
        <View style={containerStyle}>
            {grid}
        </View>
    )
}

export interface GridProps {
    columnCount: number
    rowHeight: ViewStyle["height"]
    containerStyle?: StyleProp<ViewStyle>
    marginBetweenHorizontal?: number
    marginBetweenVertical?: number
    gridStyle?: StyleProp<Omit<ViewStyle, "marginRight" | "flex">>
    rowStyle?: StyleProp<Omit<ViewStyle, "height" | "flex" | "marginTop" | "flexDirection">>
}
