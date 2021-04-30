import React, { Component } from 'react'
import { ResponsiveContext, ScreenInfo } from "@src/providers"
import deepmerge from 'deepmerge';

export class Responsive<C extends React.ComponentType<any>> extends Component<ResponsiveProps<C>> {
	static contextType = ResponsiveContext;

	constructor(props: Readonly<ResponsiveProps<C>>) {
		super(props)
	}

	render() {
		const { breakpoints, component, children, commonProps = {} } = this.props
		
		return (
			<ResponsiveContext.Consumer>
				{(screenInfo) => {
					const targetPoint = this.getTargetPoint(screenInfo)
					const targetProps = (() => {
						const _targetProps = breakpoints[targetPoint]
						if (typeof _targetProps === "function") {
							const getProps = _targetProps as (() => React.ComponentProps<C>)
							return getProps() 
						}
						return _targetProps
					})()
					const _props = deepmerge(commonProps, targetProps)

					return React.createElement(component, _props, children)
				}}
			</ResponsiveContext.Consumer>
		)
	}

	getTargetPoint = (screenInfo: ScreenInfo) => {
		const { breakpoints } = this.props
		const keys = Object.keys(breakpoints || {})
		const targetPoint = keys
			.map((key) => {
				return [key, Number(key.match(/\d/g)?.join("")) || 0] as const
			})
			.sort((a, b) => {
				return b[1] - a[1]
			})
			.find((breakpoint) => {
				return breakpoint[1] < screenInfo.width
			})

		if (!targetPoint) throw Error("Something is wrong with breakpoints")

		return targetPoint[0]
	}
}

export type ResponsiveProps<C extends React.ComponentClass | React.FC> = {
	component: C;
	commonProps?: React.ComponentProps<C>
	/**
	 * @param breakpoints
	 * define props for each breakpoint
	 * based on max-width
	 * example)
	 * "360px": props
	 * "540px": props
	 * "720px": props
	 */
	breakpoints: {
		[index: string]: React.ComponentProps<C> | (() => React.ComponentProps<C>)
	}
}

export default Responsive
