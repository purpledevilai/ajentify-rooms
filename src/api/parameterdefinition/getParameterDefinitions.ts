import { ParameterDefinition } from "../_types/parameterdefinition";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function getParameterDefinitions(): Promise<ParameterDefinition[]> {
  try {
    const response = await fetch(`${BASE_URL}/parameter-definitions`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const pdObj = await checkResponseAndGetJson(response);
    return pdObj["parameter_definitions"] as ParameterDefinition[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the parameter definitions';
    throw Error(errorMessage);
  }
}