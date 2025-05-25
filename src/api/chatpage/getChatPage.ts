import { BASE_URL } from "../_config/constants";
import { checkResponseAndGetJson } from "../_utils/checkResponseAndParseJson";
import { ChatPageData } from "../_types/chatpagedata";

export async function getChatPage(chatPageId: string): Promise<ChatPageData> {
  try {
    const response = await fetch(`${BASE_URL}/chat-page/${chatPageId}`, {
        method: 'GET'
    });
    return await checkResponseAndGetJson(response) as unknown as ChatPageData;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting chat page data';
    throw Error(errorMessage);
  }
}