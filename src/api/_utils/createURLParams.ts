export const createUrlParams = (params: Record<string, string>): string => {
    const filteredParams = Object.entries(params)
        .filter(([, value]) => value !== null && value !== undefined) // Exclude null and undefined values
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`) // Encode keys and values
        .join('&'); // Join with &

    return filteredParams ? `?${filteredParams}` : '';
}