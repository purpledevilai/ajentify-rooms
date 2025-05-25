import { User } from "../_types/user";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function getUser(): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as User;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the user';
    throw Error(errorMessage);
  }
}