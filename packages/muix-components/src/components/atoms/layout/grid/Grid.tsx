import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"

export class GridBase<T> extends React.Component<GridBaseProps<T>> {
  render(): JSX.Element {
    const {
      column: columnCount = 3,
      shouldRenderEmpty = true,
      cellStyle = {},
      rowStyle = {},
      items = [],
      renderItem,
      keyExtractor,
      containerStyle
    } = this.props

    const children = this.props.children
        ? React.Children.toArray(this.props.children)
        : renderItem && items.map(renderItem)
      || []
    
    const rowCount = Math.ceil(children.length / columnCount)
    const rows = Array(rowCount).fill(0).map((_, i) => {
      const from = i * columnCount
      const to = (i + 1) * columnCount
      const rowItems = items?.slice(from, to)
        .map((item, j) => ({
          index: i * columnCount + j,
          ...item,
        }))

      const _rowStyle = typeof rowStyle === "function"
        ? items && rowStyle(rowItems, i)
        : rowStyle

      return (
        <View key={`grid_base_row_${i}`} style={_rowStyle}>
          {Array(columnCount).fill(0).map((_, j) => {
            const flatIndex = i * columnCount + j
            const child = children[flatIndex]
            const item = items && items[flatIndex]
            const key = (item && keyExtractor)
              ? keyExtractor(item, j)
              : `gridbase_${flatIndex}`
            const _cellStyle = typeof cellStyle === "function"
              ? item && cellStyle(item, flatIndex)
              : cellStyle

            if (!child && !shouldRenderEmpty) return null

            return (
              <View
                key={key}
                style={_cellStyle}
                children={child}
              />
            )
          })}
        </View>
      )
    })

    return (
      <View
        style={containerStyle}
        children={rows}
      />
    )
  }
}

type GridBaseProps<T> = {
  items?: T[]
  column?: number
  renderItem?: (item: T, index: number) => React.ReactNode
  keyExtractor?: (item: T, index: number) => string
  cellStyle?: StyleProp<ViewStyle> | ((item: T, index: number) => StyleProp<ViewStyle>)
  rowStyle?: StyleProp<ViewStyle> | ((row: (T & {index: number})[], rowIndex: number) => StyleProp<ViewStyle>)
  containerStyle?: StyleProp<ViewStyle>
  shouldRenderEmpty?: boolean
}