export function getInitialValue<T> (values: T[]): T | undefined {
	return values.find((val) => val !== undefined)
}

export function anyOf<T> (values: T[]): T | undefined {
	return values.find((val) => !!val)
}