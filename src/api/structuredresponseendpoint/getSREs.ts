import { StructuredResponseEndpoint } from "../_types/structuredresponseendpoint";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export async function getSREs(orgId?: string): Promise<StructuredResponseEndpoint[]> {
  try {
    const query = orgId ? `?org_id=${orgId}` : '';
    const response = await fetch(`${BASE_URL}/sres${query}`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json',
        },
    });
    const sreObj = await checkResponseAndGetJson(response);
    return sreObj["sres"] as StructuredResponseEndpoint[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the StructuredResponseEndpoints';
    throw Error(errorMessage);
  }
}
