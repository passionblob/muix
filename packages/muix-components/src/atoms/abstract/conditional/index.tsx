import React from 'react'
import {IdentityProps, Identity} from '../identity';
import {SupportedComponent} from '../../../types'

interface ConditionalProps<C extends SupportedComponent> extends IdentityProps<C> {
	shouldRender?: boolean;
}

export class Conditional<C extends SupportedComponent> extends React.Component<ConditionalProps<C>> {
	render(): React.ReactNode {
		const {shouldRender, props, component, children} = this.props;
		if (!shouldRender) return null;
		return (
			<Identity
				props={props}
				component={component}
				children={children}
			/>
		)
	}	
}