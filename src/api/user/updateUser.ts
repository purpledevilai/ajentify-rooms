import { updateUserAttributes } from 'aws-amplify/auth';

interface UpdateUserPayload {
    first_name: string;
    last_name: string;
}

export async function updateUser(payload: UpdateUserPayload): Promise<void> {
    try {
        await updateUserAttributes({
            userAttributes: {
                'given_name': payload.first_name,
                'family_name': payload.last_name,
            },
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to update user details.';
        throw Error(errorMessage);
    }
}
