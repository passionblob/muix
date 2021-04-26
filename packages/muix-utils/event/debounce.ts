export function debounce(event: () => void, delay: number): () => void {
    let timeout = setTimeout(event, delay);
    return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(event, delay);
    }
}
