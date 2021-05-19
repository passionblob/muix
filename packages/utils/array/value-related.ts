import { getRandomIndex } from "./length-related"

export function getRandom<T extends any[]>(arr: T) {
  const randomIndex = getRandomIndex(arr)
  return arr[randomIndex]
}