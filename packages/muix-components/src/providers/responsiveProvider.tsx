import React from 'react';
import { Dimensions, Platform } from 'react-native';

import {screenSize} from '../constants';
import {ScreenSizeType} from '../types';
import {debounce} from '../utils';


const getScreenInfo = (): ScreenInfo => {
    const {width, height} = Dimensions.get("window");
    const os: ScreenInfo["os"] = (
        Platform.OS === "macos"
        || Platform.OS === "web"
        || Platform.OS === "windows"
    ) ? "web" : Platform.OS;
    
    let sizeType: ScreenSizeType = "md";

    for (const key in screenSize) {
        const screenSizeType = key as ScreenSizeType;
        if (screenSize[screenSizeType] <= width) sizeType = screenSizeType;
    }
    
    return {
        height,
        width,
        os,
        sizeType,
    }
}

const defaultResponsiveInterface: ResponsiveInterface = {
    actions: {
        down: (screenSize: ScreenSizeType) => false,
        up: (screenSize: ScreenSizeType) => false,
    },
    screen: getScreenInfo()
}

export const ResponsiveContext = React.createContext<ResponsiveInterface>(defaultResponsiveInterface);

export class ResponsiveProvider extends React.Component<ResponsiveProviderProps, ResponsiveInterface> {
    constructor(props: Readonly<ResponsiveProviderProps>) {
        super(props);
        this.state = defaultResponsiveInterface;
    }

    handleResize = (): void => {
        this.setState((state) => {
            if (state === undefined) return state;
            return {
                screen: getScreenInfo(),
                actions: {
                    down: (sizeType: ScreenSizeType) => state.screen.width <= screenSize[sizeType],
                    up: (sizeType: ScreenSizeType) => state.screen.width > screenSize[sizeType],
                }
            }
        })
    }

    debouncedResizeHandler = debounce(this.handleResize, 100);

    componentDidMount(): void {
        if (document !== undefined && window !== undefined) {
            window.addEventListener("resize", this.debouncedResizeHandler)
        } else {
            Dimensions.addEventListener("change", this.debouncedResizeHandler)
        }
    }

    componentWillUnmount(): void {
        if (document !== undefined && window !== undefined) {
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
    os: "android" | "ios" | "web";
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