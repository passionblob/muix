import React from "react"
import { SpringConfig, SpringValue, useSpring } from "react-spring"
import { useListener } from "./useListener"

/**
 * used for simple transition between 0 and 1.
 */
export const useSpringToggle = (params: SpringToggleHookParams = {}) => {
  const {
    config = {
      tension: 300,
      bounce: 0,
    },
    from = 0,
    to = 1
  } = params

  const toggled = React.useRef(false)
  const [spring, springApi] = useSpring(() => ({
    progress: from,
    config,
  }))
  
  const listenerAppended = useListener(spring.progress, {
    change: () => {},
  })

  const toggle = () => {
    springApi.start({
      progress: toggled.current ? from : to,
      onChange: () => listenerAppended.emit("change"),
    })
    
    toggled.current = !toggled.current
  }

  return [listenerAppended, toggle, toggled] as const
}

interface SpringToggleHookParams {
  config?: SpringConfig
  from?: number
  to?: number
}

export type SpringToggleHookReturnType = ReturnType<typeof useSpringToggle>