import { Tool } from "../_types/tools";
import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

interface UpdateToolPayload {
    tool_id: string;
    name?: string;
    description?: string;
    pd_id?: string;
    code?: string;
}

export async function updateTool(payload: UpdateToolPayload): Promise<Tool> {
  try {
    const response = await fetch(`${BASE_URL}/tool/${payload.tool_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as Tool;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the tool';
    throw Error(errorMessage);
  }
}