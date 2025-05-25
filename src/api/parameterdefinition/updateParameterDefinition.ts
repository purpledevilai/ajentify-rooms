import { ParameterDefinition, Parameter } from "../_types/parameterdefinition";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

interface UpdateParameterDefinitionPayload {
    pd_id: string;
    parameters: Parameter[];
}

export async function updateParameterDefinition(payload: UpdateParameterDefinitionPayload): Promise<ParameterDefinition> {
  try {
    const response = await fetch(`${BASE_URL}/parameter-definition/${payload.pd_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as ParameterDefinition;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the parameter definition';
    throw Error(errorMessage);
  }
}