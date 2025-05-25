import { Organization } from "../_types/organization";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export interface CreateOrganizationPayload {
    name: string;
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
  try {
    const response = await fetch(`${BASE_URL}/organization`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as Organization;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the organization';
    throw Error(errorMessage);
  }
}