import React from "react"
import { Animated } from "react-native"
import {SpringValue} from "react-spring"
import {useListener} from "./useListener"

export const syncAnimatedToSpring = (params: SpringAnimatedHookParams) => {
  const listenerAppened = useListener(params.spring, {
    "change": () => params.spring.get()
  })

  React.useEffect(() => {
    const unsubscribe = listenerAppened.addListner("change", (value) => {
      params.anim.setValue(value)
    })

    return unsubscribe
  }, [])

  return params.anim
}

type SpringAnimatedHookParams = {
  spring: SpringValue<number>
  anim: Animated.Value
}