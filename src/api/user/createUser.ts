import { SimpleUser } from "../_types/simpleuser";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function createUser(): Promise<SimpleUser> {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    return await checkResponseAndGetJson(response) as unknown as SimpleUser;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the user';
    throw Error(errorMessage);
  }
}