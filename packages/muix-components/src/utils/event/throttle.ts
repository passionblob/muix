export function throttle(event: VoidFunction, interval: number): VoidFunction {
    let lastExecutionTimestamp = Date.now();
    let triggered = false;
    return () => {
        const now = Date.now();
        if (!triggered) {
            lastExecutionTimestamp = now;
            event()
        } else if (now - lastExecutionTimestamp >= interval) {
            triggered = false;
        }
    }
}