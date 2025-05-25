import { signIn as awsSignIn } from "aws-amplify/auth";

export interface SignInPayload {
    email: string;
    password: string;
}

export async function signIn(payload: SignInPayload): Promise<void> {
    try {
        await awsSignIn({
            username: payload.email,
            password: payload.password,
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign up';
        throw Error(errorMessage);
    }
}
