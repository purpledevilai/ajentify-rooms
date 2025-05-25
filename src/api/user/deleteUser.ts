import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function deleteUser(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
        method: 'DELETE',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    await checkResponseAndGetJson(response);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the user';
    throw Error(errorMessage);
  }
}