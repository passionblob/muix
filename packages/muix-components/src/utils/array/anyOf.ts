export function getInitialValue<T> (values: T[]): T | undefined {
	return values.find((val) => val !== undefined)
}
