import { signUp as awsSignUp } from "aws-amplify/auth";

export interface SignUpPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export async function signUp(payload: SignUpPayload): Promise<unknown> {
    try {
        return await awsSignUp({
            username: payload.email,
            password: payload.password,
            options: {
                userAttributes: {
                    email: payload.email,
                    given_name: payload.firstName,
                    family_name: payload.lastName,
                },
            }
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign up';
        throw Error(errorMessage);
    }
}
