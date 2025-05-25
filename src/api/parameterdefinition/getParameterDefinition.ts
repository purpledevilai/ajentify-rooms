import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { ParameterDefinition } from "../_types/parameterdefinition";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";

export async function getParameterDefinition(pdId: string): Promise<ParameterDefinition> {
  try {
    const response = await fetch(`${BASE_URL}/parameter-definition/${pdId}`, {
      method: 'GET',
      headers: {
        'Authorization': await getAccessToken() || '',
        'Content-Type': 'application/json'
      },
    });
    return await checkResponseAndGetJson(response) as unknown as ParameterDefinition;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting parameter definition data';
    throw Error(errorMessage);
  }
}