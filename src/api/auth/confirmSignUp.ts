// import { Auth } from 'aws-amplify';
import { confirmSignUp as awsConfirmSignUp } from "aws-amplify/auth";

export interface ConfirmSignUpPayload {
    email: string;
    verificationCode: string;
}

export async function confirmSignUp(payload: ConfirmSignUpPayload): Promise<void> {
    try {
        await awsConfirmSignUp({
            username: payload.email,
            confirmationCode: payload.verificationCode,
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign up';
        throw Error(errorMessage);
    }
}
