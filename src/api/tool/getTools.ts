import { Tool } from "../_types/tools";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";


export async function getTools(agentId?: string): Promise<Tool[]> {
  try {
    const query = agentId ? `?agent_id=${agentId}` : '';
    const response = await fetch(`${BASE_URL}/tools${query}`, {
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const toolObj = await checkResponseAndGetJson(response);
    return toolObj["tools"] as Tool[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the tools';
    throw Error(errorMessage);
  }
}