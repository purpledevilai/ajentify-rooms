import { Agent } from "../_types/agent";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

interface CreateAgentPayload {
    agent_name: string;
    agent_description: string;
    is_public: boolean;
    prompt: string;
    agent_speaks_first: boolean;
    tools?: string[];
    uses_prompt_args?: boolean;
}

export async function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  try {
    const response = await fetch(`${BASE_URL}/agent`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as Agent;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the agents';
    throw Error(errorMessage);
  }
}