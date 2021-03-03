import {ScreenSizeType} from '../types'

export const screenSize: {[key in ScreenSizeType]: number} = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
} as const