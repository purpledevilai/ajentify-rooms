import { resetPassword } from 'aws-amplify/auth';

export async function forgotPassword(email: string): Promise<void> {
    try {
        await resetPassword({ username: email });
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred during password reset.';
        throw Error(errorMessage);
    }
}
