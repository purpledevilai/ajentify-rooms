import { JsonDocument } from "../_types/jsondocument";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export async function getJsonDocuments(): Promise<JsonDocument[]> {
  try {
    const response = await fetch(`${BASE_URL}/json-documents`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const obj = await checkResponseAndGetJson(response);
    return obj["json_documents"] as JsonDocument[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the documents';
    throw Error(errorMessage);
  }
}
