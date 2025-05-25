import { Agent } from "../_types/agent";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function getAgents(): Promise<Agent[]> {
  try {
    const response = await fetch(`${BASE_URL}/agents`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const agentsObj = await checkResponseAndGetJson(response);
    return agentsObj["agents"] as Agent[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the agents';
    throw Error(errorMessage);
  }
}