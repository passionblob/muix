export type SupportedComponent<P=Record<string,unknown>> = React.ComponentClass<P> | React.FC<P>;

export type Props<C extends SupportedComponent> =
    C extends SupportedComponent<infer P> ? P : never

export type ScreenSizeType = "xs" | "sm" | "md" | "lg" | "xl";

export type Nullable<T> = T | null | undefined
