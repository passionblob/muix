import { getRandomIndex } from "./length-related"

export function getRandom<T extends any[]>(arr: T) {
  const randomIndex = getRandomIndex(arr)
  return arr[randomIndex]
}

export const isAllTrue = (bools: boolean[]) => {
  for (let i = 0; i < bools.length; i += 1) {
      if (!bools[i]) return false;
  }
  return true;
}

export function getInitialValue<T> (values: T[]): T | undefined {
	return values.find((val) => val !== undefined)
}

export function anyOf<T> (values: T[]): T | undefined {
	return values.find((val) => !!val)
}

export function getRange(from: number, to: number) {
  const result = []
  for (let i = from; i <= to; i += 1) {
    result.push(i)
  }
  return result
}