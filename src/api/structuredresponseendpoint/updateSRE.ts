import { StructuredResponseEndpoint } from "../_types/structuredresponseendpoint";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

interface UpdateSREPayload {
    sre_id: string;
    name?: string;
    description?: string;
    is_public?: boolean;
}

export async function updateSRE(payload: UpdateSREPayload): Promise<StructuredResponseEndpoint> {
  try {
    const response = await fetch(`${BASE_URL}/sre/${payload.sre_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return await checkResponseAndGetJson(response) as unknown as StructuredResponseEndpoint;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the StructuredResponseEndpoint';
    throw Error(errorMessage);
  }
}
