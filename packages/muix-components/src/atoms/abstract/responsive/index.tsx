import React, { Component } from 'react'
import {SupportedComponent, Props, ScreenSizeType} from '../../../types'
import {ResponsiveContext, ResponsiveProvider} from '../../../providers/responsiveProvider'
import Identity from '../identity';

type PropsForScreens<C extends SupportedComponent> = {
    [key in ScreenSizeType]?: Props<C>;
}

type ResponsiveProps<C extends SupportedComponent> = {
    component?: C;
    fallbackProps: Props<C>;
} & PropsForScreens<C>;

export class Responsive<C extends SupportedComponent> extends Component<ResponsiveProps<C>> {
    static contextType = ResponsiveContext;

    componentDidMount() {
        console.log(this.context);
    }

    render() {
        const {renderForScreen} = this;
        return (
            <ResponsiveContext.Consumer>
                {(responsiveInterface) => renderForScreen(responsiveInterface.screen.sizeType)}
            </ResponsiveContext.Consumer>
        )
    }

    renderForScreen = (sizeType: ScreenSizeType) => {
        const {props} = this;
        const {children, component, fallbackProps} = props;

        return (
            <Identity
                component={component}
                props={props[sizeType] || fallbackProps}
                children={children}
            />
        )
    }
}

export default Responsive
