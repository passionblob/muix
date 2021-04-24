export const colorProperties = [
    "backgroundColor", "borderColor", "borderEndColor",
    "borderLeftColor", "borderRightColor", "borderStartColor",
    "borderTopColor", "borderBottomColor", "shadowColor",
] as const

export const numberProperties = [
    "borderRadius", "aspectRatio", "borderTopLeftRadius",
    "borderTopRightRadius", "borderBottomLeftRadius",
    "borderBottomRightRadius", "borderBottomWidth",
    "borderRightWidth", "borderLeftWidth", "borderTopWidth",
    "flex", "flexGrow", "flexShrink", "opacity", "rotation",
    "scaleX", "scaleY", "borderWidth", "shadowOpacity",
    "zIndex", "translateX", "translateY", "shadowRadius",
    "borderBottomEndRadius", "borderBottomStartRadius",
    "borderTopStartRadius", "borderTopEndRadius", "elevation",
] as const

export const lengthProperties = [
    "borderStartWidth", "borderEndWidth", "width",
    "height", "margin", "marginBottom", "marginEnd",
    "marginHorizontal", "marginLeft", "marginRight",
    "marginStart", "marginTop", "marginVertical",
    "maxHeight", "maxWidth", "minHeight", "minWidth",
    "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
    "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
    "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
] as const

export const nonInterpolatableProperties = [
    "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
    "display", "direction", "flexDirection", "flexWrap", "justifyContent", "overflow",
    "position", "borderStyle", "end", "start", "testID",
] as const

export const layoutProperties = [
    "shadowOffset"
] as const