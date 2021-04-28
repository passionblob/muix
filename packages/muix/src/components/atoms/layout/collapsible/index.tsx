import React from 'react'
import { AnimatedCollapsible } from "./animated.collapsible"
import { CollapsibleProps, CollapsibleState } from './types'

export class Collapsible extends React.Component<CollapsibleProps, CollapsibleState> {
  render() {
    const {..._props} = this.props
    // if (engine === "reanimated") return <ReanimatedCollapsible {..._props} />
    return <AnimatedCollapsible {..._props} />
  }
}

export * from "./types"

export default Collapsible
