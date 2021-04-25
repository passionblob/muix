type PredefinedBreakpoints = "320px" | "480px" | "560px" | "720px" | "1080px"
type BreakpointDefinition<T> = {
    [K in PredefinedBreakpoints]?: T
}

export const defineBreakpoints = <T>(definition: BreakpointDefinition<T>) => definition