import React from 'react'
import {Identity} from '../identity';
import deepmerge from 'deepmerge';

export class Conditional<C extends React.ComponentType<any>> extends React.Component<ConditionalProps<C>> {
	render(): React.ReactNode {
		const {shouldRender, defaultProps, commonProps, cases, component, children} = this.props;
		if (!shouldRender) return null;
		if (defaultProps === undefined) throw new Error("should provide defaultProps")
		const satisfyingCase = cases?.find(([bool]) => bool === true)
		const propForCase = satisfyingCase ? satisfyingCase[1] : defaultProps || {}
		const mergedProps = deepmerge(commonProps || {}, propForCase)
		return (
			<Identity
				props={mergedProps}
				component={component}
				children={children}
			/>
		)
	}	
}

interface ConditionalProps<C extends React.ComponentType<any>> {
	shouldRender?: boolean
	component: C
	defaultProps: React.ComponentProps<C>
	commonProps?: Partial<React.ComponentProps<C>>
	cases?: [boolean, Partial<React.ComponentProps<C>>][]
}
