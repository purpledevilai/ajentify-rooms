import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export interface DeleteContextPayload {
    context_id: string;
}

export async function deleteContext({context_id}: DeleteContextPayload): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/context/${context_id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    await checkResponseAndGetJson(response);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred deleting the context';
    throw Error(errorMessage);
  }
}