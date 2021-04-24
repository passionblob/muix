import React, { Component } from 'react'
import {SupportedComponent, Props, ScreenSizeType} from '../../../../types'
import {ResponsiveContext, ResponsiveInterface} from '../../../../providers/responsiveProvider'
import Identity from '../identity'
import {getInitialValue} from "../../../../utils"
import deepmerge from "deepmerge"

type PropsForScreens<C extends SupportedComponent> = {
    [key in ScreenSizeType]?: Partial<Props<C>>;
}

type ResponsiveProps<C extends SupportedComponent> = {
    component?: C;
    commonProps?: Partial<Props<C>>;
    fallback?: ScreenSizeType;
    render?: ((responsive: ResponsiveInterface) => JSX.Element)
} & PropsForScreens<C>;
export class Responsive<C extends SupportedComponent> extends Component<ResponsiveProps<C>> {
    static contextType = ResponsiveContext;

    private fallbackProps: Partial<Props<C>>;

    constructor(props: Readonly<ResponsiveProps<C>>) {
        super(props)

        const {fallback, render} = props;
        const anyPropsForScreen = getInitialValue([
            props.mxs, props.msm, props.mlg,
            props.tablet, props.md, props.lg, props.xl
        ])

        if (anyPropsForScreen === undefined && render === undefined) {
            throw new Error("Provide props for at least one screen size")
        }

        const fallbackProps = fallback ? props[fallback] : null;
        if (fallbackProps === undefined) {
            throw new Error("props.fallback should indicate screen size which is provided with props")
        }

        this.fallbackProps = fallbackProps || anyPropsForScreen || {};
    }

    render() {
        const {renderForScreen} = this;
        return (
            <ResponsiveContext.Consumer>
                {(responsiveInterface) => renderForScreen(responsiveInterface)}
            </ResponsiveContext.Consumer>
        )
    }

    renderForScreen = (responsiveInterface?: ResponsiveInterface) => {
        
        const {props, fallbackProps} = this;
        const {children, component, commonProps, render} = props;

        // TODO: check if this would be okay for every devices.
        // There could be a case where device cannot capture dimensions
        if (responsiveInterface === undefined) return null

        const sizeType = responsiveInterface.screen?.sizeType || "xs";
        const renderResult = render ? render(responsiveInterface) : null;

        if (renderResult && component) throw new Error("render and component conflicts each other")

        if (renderResult) return renderResult

        if (props[sizeType] === undefined) console.warn(`${props.component?.displayName} has no props for screen size: ${sizeType}`)
        const target = props[sizeType] || fallbackProps || {}
        const source = commonProps || {}
        
        const mergedProps = deepmerge(source, target) as Props<C>

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
