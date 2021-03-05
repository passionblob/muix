import React, { Component } from 'react'
import {SupportedComponent, Props, ScreenSizeType} from '../../../../types'
import {ResponsiveContext, ResponsiveInterface} from '../../../../providers/responsiveProvider'
import Identity from '../identity';
import {anyOf} from "../../../../utils"
import deepmerge from "deepmerge"

type PropsForScreens<C extends SupportedComponent> = {
    [key in ScreenSizeType]?: Props<C>;
}

type ResponsiveProps<C extends SupportedComponent> = {
    component?: C;
    commonProps?: Props<C>;
    fallback?: ScreenSizeType;
    render?: ((responsive: ResponsiveInterface) => any)
} & PropsForScreens<C>;
export class Responsive<C extends SupportedComponent> extends Component<ResponsiveProps<C>> {
    static contextType = ResponsiveContext;

    private fallbackProps: ResponsiveProps<C>;

    constructor(props: Readonly<ResponsiveProps<C>>) {
        super(props)

        const {fallback} = props;
        const anyPropsForScreen = anyOf(props.lg, props.md, props.sm, props.xl, props.xs)

        if (anyPropsForScreen === undefined) {
            throw new Error("Provide props for at least one screen size")
        }

        const fallbackProps = fallback ? props[fallback] : null;
        if (fallbackProps === undefined) {
            throw new Error("props.fallback should indicate screen size which is provided with props")
        }

        this.fallbackProps = fallbackProps || anyPropsForScreen;
    }

    render() {
        const {renderForScreen} = this;
        return (
            <ResponsiveContext.Consumer>
                {(responsiveInterface) => renderForScreen(responsiveInterface)}
            </ResponsiveContext.Consumer>
        )
    }

    renderForScreen = (responsiveInterface: ResponsiveInterface) => {
        const sizeType = responsiveInterface.screen?.sizeType || "xs";
        const {props, fallbackProps} = this;
        const {children, component, commonProps, render} = props;

        const renderResult = render ? render(responsiveInterface) : null;

        if (renderResult && component) throw new Error("render and component conflicts each other")

        const mergedProps = deepmerge(
            props[sizeType] || fallbackProps || {},
            commonProps || {}
        ) as Props<C> | undefined;

        return (
            <Identity
                component={component}
                props={mergedProps}
                children={children}
            />
        )
    }
}

export default Responsive
