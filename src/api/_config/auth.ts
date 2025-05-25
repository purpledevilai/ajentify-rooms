import { fetchAuthSession } from "aws-amplify/auth";

export const getAccessToken = async (): Promise<string | undefined> => {
    try {
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken.toString();
        return accessToken;
    } catch (error) {
        console.error('Failed to get auth token', error);
        return undefined;
    }
}