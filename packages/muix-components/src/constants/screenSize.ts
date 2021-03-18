import {ScreenSizeType} from '../types'

export const screenSize: {[key in ScreenSizeType]: number} = {
    mxs: 320,
    msm: 360,
    mlg: 480,
    tablet: 960,
    md: 960,
    lg: 1280,
    xl: 1920,
} as const

