export const keysOf = <T extends Record<string, any>[]>(...args: T): (keyof T[number])[] => {
    return args.map((obj) => Object.keys(obj))
        .reduce((acc, ele) => acc.concat(ele)) as (keyof T[number])[]
}
