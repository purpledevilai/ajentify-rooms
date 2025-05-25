import { getAccessToken } from "../_config/auth";
import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";

export async function deleteChatPage(chatPageId: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/chat-page/${chatPageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': await getAccessToken() || '',
            'Content-Type': 'application/json'
        }
    });
    await checkResponseAndGetJson(response);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred deleting the chat page';
    throw Error(errorMessage);
  }
}