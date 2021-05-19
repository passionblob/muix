import utils from ".."

type ExtractNonNullableKeys<T> = Exclude<{
  [K in keyof T]: T[K] extends null
    ? false
    : T[K] extends undefined
      ? false
      : K
}[keyof T], false>

type ExtractNonNullable<T> = {
  [K in ExtractNonNullableKeys<T>]: T[K]
}

type MergeNonNullable<T1, T2> = ExtractNonNullable<T1> & ExtractNonNullable<T2>

export const mapWithDefaultValue = <T, D extends T>(origin: T, defaultObj: D) => {
  return Object.entries(defaultObj)
    .reduce((acc, [key, value]) => {
      const originValue = origin[key as keyof T]
      const mappedValue = originValue === undefined ? value : originValue
      acc[key as keyof MergeNonNullable<T, D>] = mappedValue
      return acc
    }, {} as MergeNonNullable<T, D>)
}

export const makeRecords = <Keys extends Readonly<string[]>, T>(
  keys: Keys, value: T
): Record<Keys[number], T> => {
  return keys.reduce((acc, key) => {
      acc[key as Keys[number]] = value
      return acc
  }, {} as Record<Keys[number], T>)
}

export function getRandomEntry<T extends Record<string, any>>(obj: T): {key: keyof T, value: T[keyof T]} {
  const keys = Object.keys(obj)
  const randomKey = utils.array.getRandom(keys)
  return {
    key: randomKey,
    value: obj[randomKey]
  }
}