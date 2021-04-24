export const pickKeysOfType
: <O>(...keys: (keyof O)[]) => (keyof O)[]
= (...keys) => {
  return keys
}

export const keysOf = <T extends any[]>(...args: T): (keyof T[number])[] => {
  return args.map((obj) => Object.keys(obj || {}))
    .reduce((acc, ele) => acc.concat(ele)) as (keyof T[number])[]
}
