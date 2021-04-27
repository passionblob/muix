export const isAllTrue = (bools: boolean[]) => {
    for (let i = 0; i < bools.length; i += 1) {
        if (!bools[i]) return false;
    }
    return true;
}