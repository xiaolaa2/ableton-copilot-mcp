export function getLocalDate(): Date {
    const localTime = new Date().toLocaleString(undefined, {
        hour12: false
    }).replace(/\//g, '-').replace(',', '')
    return new Date(localTime)
}