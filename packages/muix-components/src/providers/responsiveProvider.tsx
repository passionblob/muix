import React from 'react';
import { Dimensions, Platform, PlatformOSType } from 'react-native';

import {debounce} from '../utils';

const getScreenInfo = (): ScreenInfo => {
    const {width: curScreenWidth, height} = Dimensions.get("window");
    
    return {
        height,
        width: curScreenWidth,
        os: Platform.OS,
    }
}

export const ResponsiveContext = React.createContext<ScreenInfo>(getScreenInfo());

export class ResponsiveProvider extends React.Component<ResponsiveProviderProps, ScreenInfo> {
    constructor(props: Readonly<ResponsiveProviderProps>) {
        super(props);
        this.state = getScreenInfo();
    }

    handleResize = (): void => {
        const screenInfo = getScreenInfo();
        this.setState(screenInfo)
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
    width: number;
    height: number;
}

export interface ResponsiveProviderProps {
    children: React.ReactNode;
}