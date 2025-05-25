export const checkResponseAndGetJson = async (res: Response): Promise<Record<string, unknown>> => {
    if (!res.ok) {
        let resJson;
        try {
            resJson = await res.json()
        } catch (error) {
            console.error('Error parsing response JSON:', error);
            throw Error(`Request failed with status: ${res.status}`)
        }
        if ('error' in resJson) {
            throw Error(resJson.error);
        }
    }
    return await res.json();
}