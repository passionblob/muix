import React from 'react'
import {IdentityProps, Identity} from '../identity';
import {Props, SupportedComponent} from '../../../../types'
import deepmerge from 'deepmerge';

interface ConditionalProps<C extends SupportedComponent> {
	shouldRender?: boolean
	component: C
	defaultProps: Props<C>
	commonProps?: Partial<Props<C>>
	cases?: [boolean, Partial<Props<C>>][]
}

export class Conditional<C extends SupportedComponent> extends React.Component<ConditionalProps<C>> {
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