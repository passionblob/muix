import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"


export class GridBase<T> extends React.Component<GridBaseProps<T>> {
  render(): JSX.Element {
    const {
      column: columnCount = 3,
      shouldRenderEmpty,
      cellStyle = {},
      rowStyle = {},
      items = [],
      renderItem,
      keyExtractor,
      containerStyle,
      marginBetweenColumns = 8,
      marginBetweenRows = 8
    } = this.props

    const children = this.props.children
        ? React.Children.toArray(this.props.children)
        : renderItem && items.map(renderItem)
      || []

    const _shouldRenderEmpty = (() => {
      if (shouldRenderEmpty !== undefined) return shouldRenderEmpty
      return children.length > columnCount
    })()
    
    const rowCount = Math.ceil(children.length / columnCount)
    const rows = Array(rowCount).fill(0).map((_, i) => {
      const from = i * columnCount
      const to = (i + 1) * columnCount
      const rowItems = items.slice(from, to)
        .map((item, j) => ({
          index: i * columnCount + j,
          ...item,
        }))

      const isNotStartOfRows = i > 0
      const shouldRenderMarginRow = isNotStartOfRows && marginBetweenRows
      const _rowStyle = StyleSheet.flatten([
        styles.row,
        shouldRenderMarginRow ? {marginTop: marginBetweenRows} : {},
        typeof rowStyle === "function"
          ? items && rowStyle(rowItems, i)
          : rowStyle
      ])

      return (
        <View key={`grid_base_row_${i}`} style={_rowStyle}>
          {Array(columnCount).fill(0).map((_, j) => {
            const flatIndex = i * columnCount + j
            const child = children[flatIndex]
            const item = items && items[flatIndex]
            const key = (item && keyExtractor)
              ? keyExtractor(item, j)
              : `gridbase_${flatIndex}`

            const isNotStartOfColumns = j > 0
            const shouldRenderMarginColumn = isNotStartOfColumns && marginBetweenColumns
            const _cellStyle = StyleSheet.flatten([
              styles.cell,
              shouldRenderMarginColumn ? {marginLeft: marginBetweenColumns} : {},
              typeof cellStyle === "function"
                ? item && cellStyle(item, flatIndex)
                : cellStyle
            ])

            if (!child && !_shouldRenderEmpty) return null

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

    const _containerStyle = StyleSheet.flatten([
      styles.container,
      containerStyle,
    ])

    return (
      <View
        style={_containerStyle}
        children={rows}
      />
    )
  }
}

export interface GridBaseProps<T> {
  items?: T[]
  column?: number
  renderItem?: (item: T, index: number) => React.ReactElement
  keyExtractor?: (item: T, index: number) => string
  cellStyle?: StyleProp<ViewStyle> | ((item: T, flatIndex: number) => StyleProp<ViewStyle>)
  rowStyle?: StyleProp<ViewStyle> | ((row: (T & {index: number})[], rowIndex: number) => StyleProp<ViewStyle>)
  containerStyle?: StyleProp<ViewStyle>
  shouldRenderEmpty?: boolean
  /**@param marginBetweenRows this overrides rowStyle.marginBottom */
  marginBetweenRows?: number
  /**@param marginBetweenColumns this overrides cellStyle.marginRight */
  marginBetweenColumns?: number
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row"
  },
  cell: {
    flex: 1,
  }
})