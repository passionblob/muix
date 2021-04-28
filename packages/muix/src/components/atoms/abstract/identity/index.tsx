import React, { RefObject } from 'react'

export interface IdentityProps<C extends React.ComponentType<any>> {
	component?: C;
	props?: React.ComponentProps<C>;
	ref?: RefObject<C>;
}

export class Identity<C extends React.ComponentType<any>> extends React.Component<IdentityProps<C>> {
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
