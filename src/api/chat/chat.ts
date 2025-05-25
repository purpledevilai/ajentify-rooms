import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { ChatResponse } from "../_types/chatresponse";

export interface ChatPayload {
    context_id: string;
    message: string;
}

export async function chat(payload: ChatPayload): Promise<ChatResponse> {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as ChatResponse;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred durring chat call';
    throw Error(errorMessage);
  }
}