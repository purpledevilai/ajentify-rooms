import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { Job } from "../_types/job";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export interface CreateTeamPayload {
    business_name: string;
    business_description: string;
    link_data: { link: string, data: string }[];
    selected_members: string[];
}

export async function createTeam(payload: CreateTeamPayload): Promise<Job> {
  try {
    const response = await fetch(`${BASE_URL}/create-team`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as Job;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the team';
    throw Error(errorMessage);
  }
}