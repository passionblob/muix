export type SupportedComponent<P=any> = React.ComponentClass<P> | React.FC<P>;

export type Props<C extends SupportedComponent> =
    C extends SupportedComponent<infer P> ? P : never

export type ScreenSizeType = "mxs" | "msm" |"mlg" | "tablet" | "md" | "lg" | "xl";

export type Nullable<T> = T | null | undefined