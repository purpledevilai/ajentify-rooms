import { JsonDocument } from "../_types/jsondocument";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

interface CreateJsonDocumentPayload {
    name: string;
    data: Record<string, unknown>;
}

export async function createJsonDocument(payload: CreateJsonDocumentPayload): Promise<JsonDocument> {
  try {
    const response = await fetch(`${BASE_URL}/json-document`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as JsonDocument;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the document';
    throw Error(errorMessage);
  }
}
