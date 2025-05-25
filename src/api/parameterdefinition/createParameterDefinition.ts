import { ParameterDefinition, Parameter } from "../_types/parameterdefinition";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

interface CreateParameterDefinitionPayload {
    parameters: Parameter[];
}

export async function createParameterDefinition(payload: CreateParameterDefinitionPayload): Promise<ParameterDefinition> {
    try {
        const response = await fetch(`${BASE_URL}/parameter-definition`, {
            method: 'POST',
            headers: {
                'Authorization': await getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        return await checkResponseAndGetJson(response) as unknown as ParameterDefinition;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the parameter definitions';
        throw Error(errorMessage);
    }
}
