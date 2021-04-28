import { LayoutRectangle, StyleProp, ViewStyle } from "react-native";

export type CollapsibleState = {
  collapsed: boolean,
  capturedLayout?: LayoutRectangle
}

export interface CollapsibleHeaderProps {
  collapsed: boolean
  toggleCollapsed: () => void
}

export interface CollapsibleProps {
  /** override internal state */
  collapsed?: boolean
  initialState?: "collapsed" | "open"
  onEnd?: (state: {collapsed: boolean}) => void
  header: React.ComponentType<CollapsibleHeaderProps>
  style?: StyleProp<ViewStyle>
  // engine?: "animated" | "reanimated"
}