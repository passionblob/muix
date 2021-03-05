export function anyOf<T extends Exclude<any, any[]>>(...args: T[]): T | undefined {
    for(let i = 0; i < args.length; i += 1) {
        if (args[i]) return args[i];
    }
    return undefined;
}
