export function debounce(event: VoidFunction, delay: number): VoidFunction {
    let timeout = setTimeout(event, delay);
    return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(event, delay);
    }
}
