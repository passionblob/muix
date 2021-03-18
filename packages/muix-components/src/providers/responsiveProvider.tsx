import React from 'react';
import { Dimensions, Platform, PlatformOSType } from 'react-native';

import {screenSize} from '../constants';
import {ScreenSizeType} from '../types';
import {debounce} from '../utils';

const getScreenInfo = (): ScreenInfo => {
    const {width: curScreenWidth, height} = Dimensions.get("window");
    
    let sizeType: ScreenSizeType = "md";
    let foundSize = false

    for (const key in screenSize) {
        const screenSizeType = key as ScreenSizeType;
        if (screenSize[screenSizeType] >= curScreenWidth && !foundSize) {
            sizeType = screenSizeType;
            foundSize = true;
        }
    }
    
    return {
        height,
        width: curScreenWidth,
        os: Platform.OS,
        sizeType,
    }
}

const createResponsiveInterface = (): ResponsiveInterface => {
    const screenInfo = getScreenInfo()
    return {
        screen: screenInfo,
        actions: {
            down: (sizeType: ScreenSizeType) => {
                return screenInfo.width <= screenSize[sizeType]
            },
            up: (sizeType: ScreenSizeType) => {
                return screenInfo.width > screenSize[sizeType]
            },
        }
    }
}

export const ResponsiveContext = React.createContext<undefined | ResponsiveInterface>(undefined);

export class ResponsiveProvider extends React.Component<ResponsiveProviderProps, ResponsiveInterface> {
    constructor(props: Readonly<ResponsiveProviderProps>) {
        super(props);
        this.state = createResponsiveInterface();
    }

    handleResize = (): void => {
        const responsiveInterface = createResponsiveInterface();
        this.setState(responsiveInterface)
    }

    debouncedResizeHandler = debounce(this.handleResize, 100);

    componentDidMount(): void {
        if (Platform.OS === "web" && document !== undefined && window !== undefined) {
            window.addEventListener("resize", this.debouncedResizeHandler)
        } else {
            Dimensions.addEventListener("change", this.debouncedResizeHandler)
        }
    }

    componentWillUnmount(): void {
        if (Platform.OS === "web" && document !== undefined && window !== undefined) {
            window.removeEventListener("resize", this.debouncedResizeHandler)
        } else {
            Dimensions.removeEventListener("change", this.debouncedResizeHandler)
        }        
    }

    render(): React.ReactNode {
        const {props, state} = this;
        if (!state) return props.children;
        return (
            <ResponsiveContext.Provider value={state}>
                {props.children}
            </ResponsiveContext.Provider>
        )
    }
}


export interface ScreenInfo {
    os: PlatformOSType;
    sizeType: ScreenSizeType;
    width: number;
    height: number;
}

export interface ResponsiveAction {
    (size: ScreenSizeType): boolean;
}

export interface ResponsiveInterface {
    screen: ScreenInfo;
    actions: {
        up: ResponsiveAction;
        down: ResponsiveAction;
    }
}

export interface ResponsiveProviderProps {
    children: React.ReactNode;
}