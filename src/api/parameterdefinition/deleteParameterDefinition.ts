import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export async function deleteParameterDefinition(pdId: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/parameter-definition/${pdId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        }
    });
    await checkResponseAndGetJson(response);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred deleting the parameter definition';
    throw Error(errorMessage);
  }
}