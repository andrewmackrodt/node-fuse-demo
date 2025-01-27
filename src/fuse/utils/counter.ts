export function counter(start = 0) {
    return {
        next: () => start++,
    }
}
