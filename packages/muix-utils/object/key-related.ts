export const pickKeysOfType
: <O>(...keys: (keyof O)[]) => (keyof O)[]
= (...keys) => {
  return keys
}

export const keysOf = <T extends any[]>(...args: T): (keyof T[number])[] => {
  return args.map((obj) => Object.keys(obj || {}))
    .reduce((acc, ele) => acc.concat(ele)) as (keyof T[number])[]
}

export const omit = <O extends object, K extends keyof O>(target: O, keys: K[]) => {
  type RemainingKeys = Exclude<keyof O, K>
  return Object.keys(target)
  .filter((key) => !keys.includes(key as K))
  .reduce((acc, key) => {
    const assertedKey = key as RemainingKeys
    acc[assertedKey] = target[assertedKey]
    return acc
  }, {} as {[K in RemainingKeys]: O[K]})
}