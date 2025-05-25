import { confirmResetPassword } from 'aws-amplify/auth';

interface ResetPasswordPayload {
    email: string;
    code: string;
    newPassword: string;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
    try {
        await confirmResetPassword({
            username: payload.email,
            confirmationCode: payload.code,
            newPassword: payload.newPassword,
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to reset password. Please try again.';
        throw Error(errorMessage);
    }
}
