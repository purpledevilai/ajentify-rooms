import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { StructuredResponseEndpoint } from "../_types/structuredresponseendpoint";

export async function getSRE(sreId: string): Promise<StructuredResponseEndpoint> {
  try {
    const response = await fetch(`${BASE_URL}/sre/${sreId}`, {
        method: 'GET',
    });
    return await checkResponseAndGetJson(response) as unknown as StructuredResponseEndpoint;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting SRE data';
    throw Error(errorMessage);
  }
}
