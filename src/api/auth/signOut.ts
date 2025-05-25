import { signOut as awsSignOut } from "aws-amplify/auth";

export async function signOut(): Promise<void> {
    try {
        await awsSignOut()
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign out';
        throw Error(errorMessage);
    }
}
