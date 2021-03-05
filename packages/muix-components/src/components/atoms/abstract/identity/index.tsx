import React, { RefObject } from 'react'
import {Props, SupportedComponent} from '../../../../types'

export interface IdentityProps<C extends SupportedComponent> {
	component?: C;
	props?: Props<C>;
	ref?: RefObject<C>;
}

export class Identity<C extends SupportedComponent> extends React.Component<IdentityProps<C>> {
	render(): React.ReactNode {
		const {props, component, children, ref} = this.props;
        if (component === undefined) return children;
		return React.createElement(
			component,
			{...props, ref},
			children
		);
	}	
}


export default Identity
