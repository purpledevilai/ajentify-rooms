import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { AnyType } from "../_types/tools";


export interface RunSREPayload {
    sre_id: string;
    prompt: string;
}

export async function runSRE(payload: RunSREPayload): Promise<AnyType> {
  try {
    const response = await fetch(`${BASE_URL}/run-sre/${payload.sre_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as AnyType;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred running the StructuredResponseEndpoint';
    throw Error(errorMessage);
  }
}