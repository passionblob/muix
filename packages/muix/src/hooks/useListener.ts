import React from "react"

export const useListener = <T extends object, E extends EventParamMapper<T>>(
  target: T,
  paramMapper: E
) => {
  const listnerCount = React.useRef(0)
  const listeners = React.useRef(initializeListenerStorage(paramMapper))

  const addListner: AddListnerFn<E, keyof E> = React.useCallback((eventName, listener) => {
    const id = listnerCount.current

    Object.assign(listeners.current[eventName], {
      [id]: () => {
        const param = paramMapper[eventName](target)
        listener(param)
      }
    })

    listnerCount.current += 1

    const removeListener = () => {
      delete listeners.current[eventName][id]
    }

    return removeListener
  }, [])

  const emit = (eventName: keyof E) => {
    Object.values(listeners.current[eventName])
    .forEach((listener) => listener())
  }

  const appened = React.useRef(Object.assign(target, {
    addListner,
    emit,
  })).current

  return appened
}

function initializeListenerStorage<E extends EventParamMapper<any>>(paramMapper: E) {
  return Object.keys(paramMapper)
    .reduce((acc, key) => {
      acc[key as keyof E] = {}
      return acc
    }, {} as ListenerStorage<E>)
}

type EventParamMapper<T> = Record<string, (target: T) => any>

type ListenerStorage<T extends EventParamMapper<any>> = {
  [K in keyof T]: {
    [k: number]: ReturnType<T[K]>
  }
}

type UnsubscibeFn = () => void

interface ListenerFn<T> {
  (param: T): void
}

export interface AddListnerFn<E extends EventParamMapper<any>, K extends keyof E> {
  (eventName: K, listner: ListenerFn<ReturnType<E[K]>>): UnsubscibeFn
}