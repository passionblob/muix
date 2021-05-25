export const textStyleProperties = {
  color: [
    "backgroundColor", "borderColor", "borderEndColor",
    "borderLeftColor", "borderRightColor", "borderStartColor",
    "borderTopColor", "color", "textDecorationColor",
    "textShadowColor", "borderBottomColor", "shadowColor",
  ] as const,
  number: [
    "borderRadius", "aspectRatio", "borderTopLeftRadius",
    "borderTopRightRadius", "borderBottomLeftRadius",
    "borderBottomRightRadius", "borderBottomWidth",
    "borderRightWidth", "borderLeftWidth", "borderTopWidth",
    "flex", "flexGrow", "flexShrink", "opacity", "rotation",
    "scaleX", "scaleY", "borderWidth", "shadowOpacity",
    "zIndex", "translateX", "translateY", "shadowRadius",
    "borderBottomEndRadius", "borderBottomStartRadius",
    "borderTopStartRadius", "borderTopEndRadius", "elevation",
    "fontSize", "lineHeight", "textShadowRadius", "letterSpacing",
  ] as const,
  length: [
    "borderStartWidth", "borderEndWidth", "width",
    "height", "margin", "marginBottom", "marginEnd",
    "marginHorizontal", "marginLeft", "marginRight",
    "marginStart", "marginTop", "marginVertical",
    "maxHeight", "maxWidth", "minHeight", "minWidth",
    "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
    "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
    "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
  ],
  nonInterpolable: [
    "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
    "display", "direction", "flexDirection", "flexWrap", "fontFamily",
    "fontStyle", "includeFontPadding", "justifyContent", "overflow",
    "position", "textAlign", "textAlignVertical",
    "textDecorationLine", "textDecorationStyle", "writingDirection",
    "borderStyle", "end", "start", "testID", "fontVariant", "fontWeight",
    "textTransform",
  ] as const,
  layout: [
    "shadowOffset", "textShadowOffset"
  ] as const
}

export const viewStyleProperties = {
  color: [
    "backgroundColor", "borderColor", "borderEndColor",
    "borderLeftColor", "borderRightColor", "borderStartColor",
    "borderTopColor", "borderBottomColor", "shadowColor",
  ] as const,
  number: [
    "borderRadius", "aspectRatio", "borderTopLeftRadius",
    "borderTopRightRadius", "borderBottomLeftRadius",
    "borderBottomRightRadius", "borderBottomWidth",
    "borderRightWidth", "borderLeftWidth", "borderTopWidth",
    "flex", "flexGrow", "flexShrink", "opacity", "rotation",
    "scaleX", "scaleY", "borderWidth", "shadowOpacity",
    "zIndex", "translateX", "translateY", "shadowRadius",
    "borderBottomEndRadius", "borderBottomStartRadius",
    "borderTopStartRadius", "borderTopEndRadius", "elevation",
  ] as const,
  length: [
    "borderStartWidth", "borderEndWidth", "width",
    "height", "margin", "marginBottom", "marginEnd",
    "marginHorizontal", "marginLeft", "marginRight",
    "marginStart", "marginTop", "marginVertical",
    "maxHeight", "maxWidth", "minHeight", "minWidth",
    "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
    "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
    "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
  ] as const,
  nonInterpolable: [
    "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
    "display", "direction", "flexDirection", "flexWrap", "justifyContent", "overflow",
    "position", "borderStyle", "end", "start", "testID",
  ] as const,
  layout: [
    "shadowOffset"
  ] as const
}

export const imageStyleProperties = {
  color: [
    "backgroundColor", "borderColor",
    "overlayColor", "tintColor", "shadowColor",
  ] as const,
  number: [
    "borderRadius", "aspectRatio", "borderTopLeftRadius",
    "borderTopRightRadius", "borderBottomLeftRadius",
    "borderBottomRightRadius", "borderBottomWidth",
    "borderRightWidth", "borderLeftWidth", "borderTopWidth",
    "flex", "flexGrow", "flexShrink", "opacity", "rotation",
    "scaleX", "scaleY", "borderWidth", "shadowOpacity",
    "zIndex", "translateX", "translateY", "shadowRadius",
  ] as const,
  length: [
    "borderStartWidth", "borderEndWidth", "width",
    "height", "margin", "marginBottom", "marginEnd",
    "marginHorizontal", "marginLeft", "marginRight",
    "marginStart", "marginTop", "marginVertical",
    "maxHeight", "maxWidth", "minHeight", "minWidth",
    "padding", "paddingBottom", "paddingEnd", "paddingHorizontal",
    "paddingLeft", "paddingRight", "paddingStart", "paddingTop",
    "paddingVertical", "top", "left", "right", "bottom", "flexBasis"
  ] as const,
  nonInterpolable: [
    "alignContent", "alignItems", "alignSelf", "backfaceVisibility",
    "display", "direction", "flexDirection", "flexWrap",
    "justifyContent", "overflow", "position",
    "resizeMode", "end", "start",
  ] as const,
  layout: [
    "shadowOffset"
  ] as const
}
